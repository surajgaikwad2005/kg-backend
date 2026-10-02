/**
 * drawHighlights — pure canvas painter for the validate viewer. Draws the page
 * image, the FROM/TO highlight boxes (pulsing), the connection path with flow
 * arrows, and the active filter region. No React, no side effects beyond ctx.
 */
import { baseDimensions } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_lib/utils';

function roundRect(ctx, x, y, w, h, r) {
    let radius = r;
    if (w < 2 * radius) radius = w / 2;
    if (h < 2 * radius) radius = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function drawPath(ctx, path, canvas, image, zoom) {
    const sx = canvas.width / image.width;
    const sy = canvas.height / image.height;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 220, 0, 0.85)';
    ctx.lineWidth = 6 / zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 8 / zoom;
    ctx.moveTo(path[0][0] * sx, path[0][1] * sy);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i][0] * sx, path[i][1] * sy);
    ctx.stroke();

    [0.25, 0.5, 0.75].map((f) => Math.floor(path.length * f)).forEach((idx) => {
        if (idx < 1 || idx >= path.length) return;
        const [p1, p2] = [path[idx - 1], path[idx]];
        const x1 = p1[0] * sx, y1 = p1[1] * sy, x2 = p2[0] * sx, y2 = p2[1] * sy;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len <= 1) return;
        const ux = dx / len, uy = dy / len;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - ux * (10 / zoom) + uy * (5 / zoom), y2 - uy * (10 / zoom) - ux * (5 / zoom));
        ctx.lineTo(x2 - ux * (10 / zoom) - uy * (5 / zoom), y2 - uy * (10 / zoom) + ux * (5 / zoom));
        ctx.closePath();
        ctx.fill();
    });
    ctx.restore();
}

function drawBoxes(ctx, bboxes, { fill, stroke, label, labelFill, scaleX, scaleY, zoom, pulse, filterBox }) {
    bboxes.forEach(([x1, y1, x2, y2]) => {
        const rx1 = x1 * scaleX - 8, ry1 = y1 * scaleY - 6;
        const rx2 = x2 * scaleX + 8, ry2 = y2 * scaleY + 6;
        const rw = rx2 - rx1, rh = ry2 - ry1;

        if (filterBox) {
            const fx1 = Math.min(filterBox.x1, filterBox.x2), fx2 = Math.max(filterBox.x1, filterBox.x2);
            const fy1 = Math.min(filterBox.y1, filterBox.y2), fy2 = Math.max(filterBox.y1, filterBox.y2);
            const cx = (rx1 + rx2) / 2, cy = (ry1 + ry2) / 2;
            if (cx < fx1 || cx > fx2 || cy < fy1 || cy > fy2) return;
        }

        ctx.fillStyle = fill;
        roundRect(ctx, rx1, ry1, rw, rh, 8);
        ctx.fill();
        [8, 5, 2].forEach((width, i) => {
            const alpha = [0.1 + 0.15 * pulse, 0.2 + 0.25 * pulse, 0.9][i];
            ctx.strokeStyle = stroke.replace('ALPHA', String(alpha));
            ctx.lineWidth = width / zoom;
            roundRect(ctx, rx1, ry1, rw, rh, 8);
            ctx.stroke();
        });

        ctx.font = `bold ${Math.max(10, 11 / zoom)}px sans-serif`;
        const tw = ctx.measureText(label).width;
        const lw = tw + 12 / zoom, lh = 16 / zoom;
        const lx = rx1, ly = ry1 - lh - 4 / zoom;
        ctx.fillStyle = labelFill;
        roundRect(ctx, lx, ly, lw, lh, 4 / zoom); ctx.fill();
        ctx.strokeStyle = stroke.replace('ALPHA', String(0.4 + 0.4 * pulse));
        ctx.lineWidth = 2 / zoom;
        roundRect(ctx, lx, ly, lw, lh, 4 / zoom); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, lx + 6 / zoom, ly + lh - 4 / zoom);
    });
}

export function drawHighlights(ctx, { canvas, container, imageObj, highlightData, filterBox, zoom, pan }) {
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);

    if (highlightData) {
        const { width, height } = baseDimensions(highlightData);
        const scaleX = canvas.width / width;
        const scaleY = canvas.height / height;
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);

        if (highlightData.path && highlightData.path.length > 1) {
            drawPath(ctx, highlightData.path, canvas, highlightData.image_size, zoom);
        }
        drawBoxes(ctx, highlightData.from_bboxes, { fill: 'rgba(255, 46, 99, 0.15)', stroke: 'rgba(255, 46, 99, ALPHA)', label: 'FROM', labelFill: 'rgba(255, 46, 99, 0.95)', scaleX, scaleY, zoom, pulse, filterBox });
        drawBoxes(ctx, highlightData.to_bboxes, { fill: 'rgba(0, 225, 255, 0.15)', stroke: 'rgba(0, 225, 255, ALPHA)', label: 'TO', labelFill: 'rgba(0, 180, 255, 0.95)', scaleX, scaleY, zoom, pulse, filterBox });
    }

    if (filterBox) {
        const fx1 = Math.min(filterBox.x1, filterBox.x2), fy1 = Math.min(filterBox.y1, filterBox.y2);
        const fw = Math.abs(filterBox.x2 - filterBox.x1), fh = Math.abs(filterBox.y2 - filterBox.y1);
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([6 / zoom, 4 / zoom]);
        ctx.strokeRect(fx1, fy1, fw, fh);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.04)';
        ctx.fillRect(fx1, fy1, fw, fh);
        ctx.font = `bold ${Math.max(9, 10 / zoom)}px sans-serif`;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.fillText('FILTER REGION', fx1 + 6 / zoom, fy1 + 14 / zoom);
        ctx.restore();
    }

    ctx.restore();
}
