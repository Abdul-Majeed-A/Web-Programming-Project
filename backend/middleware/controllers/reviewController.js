import pool from '../config/database.js';
import { notifyProjectMembers, notifyAdmins } from '../services/notificationService.js';

export const getStages = async (req, res, next) => {
  try {
    const [stages] = await pool.execute(
      'SELECT id, stage_name, stage_order, description, weightage, is_active FROM review_stages ORDER BY stage_order ASC'
    );

    for (const stage of stages) {
      const [criteria] = await pool.execute(
        'SELECT id, criterion_name, maximum_marks, display_order FROM review_criteria WHERE stage_id = ? ORDER BY display_order ASC',
        [stage.id]
      );
      stage.criteria = criteria;
    }

    return res.status(200).json({ success: true, data: stages });
  } catch (error) {
    next(error);
  }
};

export const getCriteriaByStage = async (req, res, next) => {
  try {
    const { stageId } = req.params;
    const [criteria] = await pool.execute(
      'SELECT id, stage_id, criterion_name, maximum_marks, display_order FROM review_criteria WHERE stage_id = ? ORDER BY display_order ASC',
      [stageId]
    );
    return res.status(200).json({ success: true, data: criteria });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [reviews] = await pool.execute(
      `SELECT r.*, p.title as project_title, rs.stage_name, rs.stage_order, u.full_name as reviewer_name
       FROM reviews r
       JOIN projects p ON r.project_id = p.id
       JOIN review_stages rs ON r.stage_id = rs.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = reviews[0];

    const [scores] = await pool.execute(
      `SELECT sc.*, rc.criterion_name, rc.maximum_marks 
       FROM review_scores sc
       JOIN review_criteria rc ON sc.criterion_id = rc.id
       WHERE sc.review_id = ?
       ORDER BY rc.display_order ASC`,
      [id]
    );

    review.scores = scores;

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getProjectReviews = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const [reviews] = await pool.execute(
      `SELECT r.*, rs.stage_name, rs.stage_order, u.full_name as reviewer_name, u.email as reviewer_email
       FROM reviews r
       JOIN review_stages rs ON r.stage_id = rs.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.project_id = ?
       ORDER BY rs.stage_order ASC, r.created_at DESC`,
      [projectId]
    );

    for (const review of reviews) {
      const [scores] = await pool.execute(
        `SELECT sc.*, rc.criterion_name, rc.maximum_marks 
         FROM review_scores sc
         JOIN review_criteria rc ON sc.criterion_id = rc.id
         WHERE sc.review_id = ?
         ORDER BY rc.display_order ASC`,
        [review.id]
      );
      review.scores = scores;
    }

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const saveDraftReview = async (req, res, next) => {
  try {
    const { projectId, stageId, scores, feedback, strengths, weaknesses, decision } = req.body;
    const reviewerId = req.user.id;

    // Verify reviewer assignment
    const [assignment] = await pool.execute(
      'SELECT id FROM project_assignments WHERE project_id = ? AND faculty_id = ?',
      [projectId, reviewerId]
    );
    if (assignment.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not assigned as reviewer for this project.' });
    }

    // Check if review already exists
    const [existing] = await pool.execute(
      'SELECT id, review_status FROM reviews WHERE project_id = ? AND stage_id = ? AND reviewer_id = ?',
      [projectId, stageId, reviewerId]
    );

    let reviewId;
    if (existing.length > 0) {
      if (existing[0].review_status === 'Submitted') {
        return res.status(400).json({
          success: false,
          message: 'This review has already been submitted and cannot be reverted to draft.',
        });
      }
      reviewId = existing[0].id;
      await pool.execute(
        `UPDATE reviews 
         SET feedback = ?, strengths = ?, weaknesses = ?, decision = ?, updated_at = NOW()
         WHERE id = ?`,
        [feedback, strengths, weaknesses, decision || null, reviewId]
      );
    } else {
      const [result] = await pool.execute(
        `INSERT INTO reviews (project_id, stage_id, reviewer_id, feedback, strengths, weaknesses, decision, review_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft')`,
        [projectId, stageId, reviewerId, feedback, strengths, weaknesses, decision || null]
      );
      reviewId = result.insertId;
    }

    // Save individual criterion scores if provided
    if (Array.isArray(scores)) {
      for (const item of scores) {
        if (!item.criterionId) continue;
        await pool.execute(
          `INSERT INTO review_scores (review_id, criterion_id, marks_awarded, comments)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE marks_awarded = VALUES(marks_awarded), comments = VALUES(comments)`,
          [reviewId, item.criterionId, item.marksAwarded || 0, item.comments || null]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Evaluation saved as draft successfully.',
      reviewId,
    });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const { projectId, stageId, scores, feedback, strengths, weaknesses, decision } = req.body;
    const reviewerId = req.user.id;

    // Verify reviewer assignment
    const [assignment] = await pool.execute(
      'SELECT id FROM project_assignments WHERE project_id = ? AND faculty_id = ?',
      [projectId, reviewerId]
    );
    if (assignment.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not assigned as reviewer for this project.' });
    }

    // Fetch criteria and max marks for validation
    const [criteria] = await pool.execute(
      'SELECT id, criterion_name, maximum_marks FROM review_criteria WHERE stage_id = ?',
      [stageId]
    );

    const criteriaMap = new Map();
    let totalMaxMarks = 0;
    criteria.forEach((c) => {
      criteriaMap.set(c.id, c.maximum_marks);
      totalMaxMarks += Number(c.maximum_marks);
    });

    let totalMarksAwarded = 0;

    // Validate marks for each criterion
    for (const score of scores) {
      const maxMarks = criteriaMap.get(Number(score.criterionId));
      if (maxMarks === undefined) {
        return res.status(400).json({
          success: false,
          message: `Criterion ID ${score.criterionId} does not belong to review stage ${stageId}.`,
        });
      }
      const awarded = Number(score.marksAwarded);
      if (awarded < 0 || awarded > maxMarks) {
        return res.status(400).json({
          success: false,
          message: `Marks awarded (${awarded}) for criterion ID ${score.criterionId} exceeds permitted range (0 - ${maxMarks}).`,
        });
      }
      totalMarksAwarded += awarded;
    }

    const percentage = totalMaxMarks > 0 ? (totalMarksAwarded / totalMaxMarks) * 100 : 0;

    // Check if review exists or create new
    const [existing] = await pool.execute(
      'SELECT id, review_status FROM reviews WHERE project_id = ? AND stage_id = ? AND reviewer_id = ?',
      [projectId, stageId, reviewerId]
    );

    let reviewId;
    if (existing.length > 0) {
      if (existing[0].review_status === 'Submitted') {
        return res.status(400).json({
          success: false,
          message: 'An evaluation for this project and review stage has already been submitted.',
        });
      }
      reviewId = existing[0].id;
      await pool.execute(
        `UPDATE reviews 
         SET total_marks = ?, percentage = ?, feedback = ?, strengths = ?, weaknesses = ?, decision = ?, review_status = 'Submitted', submitted_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [totalMarksAwarded, percentage, feedback, strengths, weaknesses, decision, reviewId]
      );
    } else {
      const [result] = await pool.execute(
        `INSERT INTO reviews (project_id, stage_id, reviewer_id, total_marks, percentage, feedback, strengths, weaknesses, decision, review_status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', NOW())`,
        [projectId, stageId, reviewerId, totalMarksAwarded, percentage, feedback, strengths, weaknesses, decision]
      );
      reviewId = result.insertId;
    }

    // Save criteria scores
    for (const score of scores) {
      await pool.execute(
        `INSERT INTO review_scores (review_id, criterion_id, marks_awarded, comments)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE marks_awarded = VALUES(marks_awarded), comments = VALUES(comments)`,
        [reviewId, score.criterionId, score.marksAwarded, score.comments || null]
      );
    }

    // Update project status according to decision and stage
    let updatedProjectStatus = 'Under Review';
    let nextStageId = stageId;

    if (decision === 'Changes Required') {
      updatedProjectStatus = 'Changes Required';
    } else if (decision === 'Rejected') {
      updatedProjectStatus = 'Rejected';
    } else if (decision === 'Approved') {
      if (Number(stageId) === 1) {
        nextStageId = 2; // Advance to Stage 2: Progress Review
        updatedProjectStatus = 'Under Review';
      } else if (Number(stageId) === 2) {
        nextStageId = 3; // Advance to Stage 3: Final Review
        updatedProjectStatus = 'Under Review';
      } else if (Number(stageId) === 3) {
        updatedProjectStatus = 'Approved';
      }
    }

    // Calculate final weighted score if completing all stages or final review
    let finalCalculatedScore = null;
    if (updatedProjectStatus === 'Approved') {
      const [allSubmittedReviews] = await pool.execute(
        `SELECT r.percentage, rs.weightage 
         FROM reviews r 
         JOIN review_stages rs ON r.stage_id = rs.id 
         WHERE r.project_id = ? AND r.review_status = 'Submitted'`,
        [projectId]
      );

      if (allSubmittedReviews.length > 0) {
        let weightedSum = 0;
        let totalWeights = 0;
        for (const rev of allSubmittedReviews) {
          const w = Number(rev.weightage || 33.33);
          weightedSum += (Number(rev.percentage) * w) / 100;
          totalWeights += w;
        }
        finalCalculatedScore = (weightedSum / (totalWeights / 100)).toFixed(2);
      }
    }

    await pool.execute(
      `UPDATE projects 
       SET status = ?, current_stage_id = ?, final_score = ?, updated_at = NOW() 
       WHERE id = ?`,
      [updatedProjectStatus, nextStageId, finalCalculatedScore, projectId]
    );

    // Notify project team members
    const [projectInfo] = await pool.execute('SELECT title FROM projects WHERE id = ?', [projectId]);
    const projectTitle = projectInfo[0]?.title || `Project #${projectId}`;

    await notifyProjectMembers(projectId, {
      title: `Review ${stageId} Evaluation Completed`,
      message: `Your project "${projectTitle}" received decision "${decision}" with ${totalMarksAwarded} marks (${percentage.toFixed(1)}%).`,
      notificationType: decision === 'Approved' ? 'project_approved' : (decision === 'Rejected' ? 'project_rejected' : 'changes_required'),
      link: `/student/projects/${projectId}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Review evaluation submitted successfully.',
      reviewId,
      totalMarks: totalMarksAwarded,
      percentage: percentage.toFixed(2),
      decision,
      projectStatus: updatedProjectStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStageConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { weightage, description, criteria } = req.body;

    if (weightage !== undefined) {
      await pool.execute('UPDATE review_stages SET weightage = ?, description = ? WHERE id = ?', [
        weightage,
        description,
        id,
      ]);
    }

    if (Array.isArray(criteria)) {
      for (const cr of criteria) {
        if (cr.id) {
          await pool.execute(
            'UPDATE review_criteria SET criterion_name = ?, maximum_marks = ?, display_order = ? WHERE id = ? AND stage_id = ?',
            [cr.criterion_name, cr.maximum_marks, cr.display_order, cr.id, id]
          );
        } else {
          await pool.execute(
            'INSERT INTO review_criteria (stage_id, criterion_name, maximum_marks, display_order) VALUES (?, ?, ?, ?)',
            [id, cr.criterion_name, cr.maximum_marks, cr.display_order]
          );
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Review stage configuration updated successfully.' });
  } catch (error) {
    next(error);
  }
};
