'use client';
import React from 'react';
import { useScenarioDetail } from '../../_queries/useScenarioQueries';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Spinner } from '@/src/components/ui/Spinner';
import { Sparkles, Calendar, Target, Percent, Cpu } from 'lucide-react';

export default function ScenarioDetailsModal({ scenarioId, onClose }) {
    const { data: detail, isLoading, error } = useScenarioDetail(scenarioId);

    return (
        <Modal
            open={!!scenarioId}
            onClose={onClose}
            title="Scenario Match Details"
            size="2xl"
        >
            <div className="flex flex-col min-h-0">
                <ModalBody className="space-y-6 overflow-y-auto max-h-[70vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : error || !detail ? (
                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs font-bold text-danger text-center">
                            {error?.message || 'Failed to load scenario match details'}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Metadata */}
                            <div className="bg-canvas/50 border border-border p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <span className="text-3xs uppercase font-black text-text-subtle">Asset</span>
                                    <span className="text-sm font-bold text-text-primary block">{detail.asset}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-3xs uppercase font-black text-text-subtle">Pattern Window</span>
                                    <span className="text-sm font-bold text-text-primary block">{detail.pattern_window} mins</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-3xs uppercase font-black text-text-subtle">Threshold</span>
                                    <span className="text-sm font-bold text-text-primary block">{detail.similarity_threshold}%</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-3xs uppercase font-black text-text-subtle">Total Tags</span>
                                    <span className="text-sm font-bold text-text-primary block">{detail.tags?.length || 0}</span>
                                </div>
                            </div>

                            {/* Prediction AI recommendation card */}
                            {detail.prediction && (
                                <div className="p-4 rounded-xl border border-brand/20 bg-brand/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase text-brand flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            AI Predictor Confidence Insight
                                        </h3>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                            detail.prediction.confidence === 'HIGH' ? 'bg-success/15 text-success' : 'bg-brand/15 text-brand'
                                        }`}>
                                            Confidence: {detail.prediction.confidence}
                                        </span>
                                    </div>
                                    <div className="text-sm text-text-secondary">
                                        <p>{detail.prediction.message}</p>
                                        {detail.prediction.status === 'MATCH_FOUND' && (
                                            <div className="mt-2 text-xs font-semibold text-text-muted flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="inline-flex items-center gap-1">
                                                    <Percent className="w-3.5 h-3.5 text-text-subtle" />
                                                    Similarity Score: <strong className="text-text-primary">{detail.prediction.similarity}%</strong>
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                                                    Match Interval: <strong className="text-text-primary">{detail.prediction.historical_start_time} to {detail.prediction.historical_end_time}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Historical Matches Table */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                    <Cpu className="w-4 h-4 text-text-subtle" />
                                    Historical Matched Episodes ({detail.matches?.length || 0})
                                </h3>
                                <div className="border border-border rounded-xl overflow-hidden bg-surface">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-surface-2/45">
                                                <th className="px-4 py-2 text-3xs font-extrabold uppercase text-text-muted">Match ID</th>
                                                <th className="px-4 py-2 text-3xs font-extrabold uppercase text-text-muted">Start Time</th>
                                                <th className="px-4 py-2 text-3xs font-extrabold uppercase text-text-muted">End Time</th>
                                                <th className="px-4 py-2 text-3xs font-extrabold uppercase text-text-muted text-right">Similarity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {detail.matches?.map((m) => (
                                                <tr key={m.match_id} className="hover:bg-surface-2/15 transition-colors">
                                                    <td className="px-4 py-2.5 text-xs text-text-primary font-bold">#{m.match_id}</td>
                                                    <td className="px-4 py-2.5 text-xs text-text-secondary">{m.start_time}</td>
                                                    <td className="px-4 py-2.5 text-xs text-text-secondary">{m.end_time}</td>
                                                    <td className="px-4 py-2.5 text-xs text-text-primary text-right font-black tabular-nums">
                                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-brand/5 border border-brand/10">
                                                            <Target className="w-3 h-3 text-brand" />
                                                            {m.similarity}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!detail.matches || detail.matches.length === 0) && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted text-xs">
                                                        No matching historical patterns identified.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </div>
        </Modal>
    );
}
