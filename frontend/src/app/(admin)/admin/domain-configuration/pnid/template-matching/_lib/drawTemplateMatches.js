/**
 * drawTemplateMatches — pure canvas painter for the matching viewer: page image,
 * match boxes (green; active one pulses red) with confidence pills, plus the
 * active crop box and manual-mark box overlays.
 */
import { cleanPdfName, isSameMatch } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_lib/utils';

export function drawTemplateMatches(ctx, {
    canvas, container, imageObj, zoom, pan,
    matches = [], activeDrawing, activeMatchHighlight, pulseFactor,
    cropBox, manualMatchBox,
}) {
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);

    const activePdf = cleanPdfName(activeDrawing?.pdf);

    matches.forEach((match) => {
        if (cleanPdfName(match.pdf) !== activePdf || match.page_no !== activeDrawing?.page_no) return;

        const [mx1, my1, mx2, my2] = match.bbox_3x;
        const scaleX = canvas.width / imageObj.naturalWidth;
        const scaleY = canvas.height / imageObj.naturalHeight;
        const rx1 = mx1 * scaleX, ry1 = my1 * scaleY;
        const rw = mx2 * scaleX - rx1, rh = my2 * scaleY - ry1;
        const isActive = isSameMatch(activeMatchHighlight, match);

        ctx.save();
        if (isActive) {
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + 0.6 * pulseFactor})`;
            ctx.lineWidth = 4 / zoom;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
            ctx.shadowBlur = 10 / zoom;
            ctx.strokeRect(rx1 - 2, ry1 - 2, rw + 4, rh + 4);
        } else {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
            ctx.lineWidth = 2.5 / zoom;
            ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
            ctx.shadowBlur = 4 / zoom;
            ctx.strokeRect(rx1, ry1, rw, rh);
        }
        ctx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.04)';
        ctx.fillRect(rx1, ry1, rw, rh);

        const label = `${Math.round(match.score * 100)}% Match`;
        ctx.font = `bold ${Math.max(9, 10 / zoom)}px sans-serif`;
        const pillW = ctx.measureText(label).width + 8 / zoom;
        const pillH = 14 / zoom;
        const pillY = ry1 - pillH - 2 / zoom;
        ctx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)';
        ctx.fillRect(rx1, pillY, pillW, pillH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, rx1 + 4 / zoom, pillY + pillH - 3 / zoom);
        ctx.restore();
    });

    if (cropBox) drawDashBox(ctx, cropBox, zoom, 'rgba(59, 130, 246, 0.9)', 'rgba(59, 130, 246, 0.06)', [6, 4]);
    if (manualMatchBox) drawDashBox(ctx, manualMatchBox, zoom, 'rgba(239, 68, 68, 0.9)', 'rgba(239, 68, 68, 0.08)', [4, 4]);

    ctx.restore();
}

function drawDashBox(ctx, box, zoom, stroke, fill, dash) {
    const x = Math.min(box.x1, box.x2);
    const y = Math.min(box.y1, box.y2);
    const w = Math.abs(box.x2 - box.x1);
    const h = Math.abs(box.y2 - box.y1);
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash(dash.map((d) => d / zoom));
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}
