/**
 * data-activity/activityService.js
 * Data Activity's view of the CDM pipeline job history.
 *
 * The endpoint itself is NOT redefined here — it belongs to the pipeline router
 * and lives in domain-configuration/common/pipelineService.js. This module only
 * applies the Data Activity table's own presentation mapping on top, so the
 * `/pipeline/jobs` contract has exactly one definition in the app (it used to be
 * declared twice, with two independently-drifting param spellings).
 */
import { listPipelineJobs, normalizePipelineJob } from '@/src/services/domain-configuration/common';

/**
 * Fetch all pipeline jobs, optionally filtered by stage.
 * Flattens the `warning` object into `error` because the Data Activity table has
 * a single failure-reason column — a job that only warned still needs to show why.
 */
export const getPipelineJobs = ({ stage, plantCode } = {}) =>
    listPipelineJobs(plantCode, { stage }).then((jobs) => {
        const rawJobs = Array.isArray(jobs) ? jobs : [];
        return rawJobs.map((raw) => {
            const j = normalizePipelineJob(raw);
            let error = j.error;
            if (j.warning && !j.error) {
                error = `${j.warning.reason}\nCategory: ${j.warning.category}\nEvidence: ${j.warning.evidence || ''}`;
            }
            return {
                ...j,
                job_id: j.pipeline_job_id,
                plant_code: j.plant_code_id || j.plant_code,
                error,
            };
        });
    });
