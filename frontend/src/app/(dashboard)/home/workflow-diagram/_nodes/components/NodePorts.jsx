import React from 'react';
import { Handle, Position } from '@xyflow/react';

const BaseHandle = ({ type, id, position, style, title, opacity = 1 }) => (
    <Handle 
        type={type} 
        id={id} 
        position={position} 
        style={{ 
            background: 'var(--color-brand)', 
            width: 8, 
            height: 8, 
            border: '1.5px solid white', 
            zIndex: 10, 
            opacity, 
            ...style 
        }} 
        title={title} 
    />
);

export function NodePorts({ normalizedType }) {
    switch (normalizedType) {
        case 'h2header5':
            return (
                <>
                    <BaseHandle type="source" id="left-out" position={Position.Left} style={{ top: '32.4%' }} title="OUT" />
                    <BaseHandle type="target" id="left-out-tgt" position={Position.Left} style={{ top: '32.4%' }} title="OUT (IN)" opacity={0} />
                    <BaseHandle type="target" id="left-in" position={Position.Left} style={{ top: '67.6%' }} title="IN" />
                    <BaseHandle type="source" id="left-in-src" position={Position.Left} style={{ top: '67.6%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="right-1" position={Position.Right} style={{ top: '23.5%' }} title="OUT-1" />
                    <BaseHandle type="target" id="right-1-tgt" position={Position.Right} style={{ top: '23.5%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-2" position={Position.Right} style={{ top: '50%' }} title="OUT-2" />
                    <BaseHandle type="target" id="right-2-tgt" position={Position.Right} style={{ top: '50%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-3" position={Position.Right} style={{ top: '76.5%' }} title="OUT-3" />
                    <BaseHandle type="target" id="right-3-tgt" position={Position.Right} style={{ top: '76.5%' }} title="OUT-3 (IN)" opacity={0} />
                </>
            );
        case 'h2header':
            return (
                <>
                    <BaseHandle type="target" id="left-in" position={Position.Left} style={{ top: '52%' }} title="IN" />
                    <BaseHandle type="source" id="left-in-src" position={Position.Left} style={{ top: '52%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="right-1" position={Position.Right} style={{ top: '36%' }} title="OUT-1" />
                    <BaseHandle type="target" id="right-1-tgt" position={Position.Right} style={{ top: '36%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-2" position={Position.Right} style={{ top: '68%' }} title="OUT-2" />
                    <BaseHandle type="target" id="right-2-tgt" position={Position.Right} style={{ top: '68%' }} title="OUT-2 (IN)" opacity={0} />
                </>
            );
        case 'h2header2in1out':
            return (
                <>
                    <BaseHandle type="target" id="left-in-1" position={Position.Left} style={{ top: '36%' }} title="IN-1" />
                    <BaseHandle type="source" id="left-in-1-src" position={Position.Left} style={{ top: '36%' }} title="IN-1 (OUT)" opacity={0} />
                    <BaseHandle type="target" id="left-in-2" position={Position.Left} style={{ top: '68%' }} title="IN-2" />
                    <BaseHandle type="source" id="left-in-2-src" position={Position.Left} style={{ top: '68%' }} title="IN-2 (OUT)" opacity={0} />
                    <BaseHandle type="source" id="right-out" position={Position.Right} style={{ top: '52%' }} title="OUT" />
                    <BaseHandle type="target" id="right-out-tgt" position={Position.Right} style={{ top: '52%' }} title="OUT (IN)" opacity={0} />
                </>
            );
        case 'xaxisheader':
            return (
                <>
                    <BaseHandle type="target" id="bottom-in" position={Position.Bottom} style={{ left: '11.6%' }} title="IN" />
                    <BaseHandle type="source" id="bottom-in-src" position={Position.Bottom} style={{ left: '11.6%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="top-out-0" position={Position.Top} style={{ top: '16.7%', left: '17.4%' }} title="OUT-0" />
                    <BaseHandle type="target" id="top-in-0" position={Position.Top} style={{ top: '16.7%', left: '17.4%' }} title="OUT-0 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-1" position={Position.Top} style={{ top: '16.7%', left: '25.4%' }} title="OUT-1" />
                    <BaseHandle type="target" id="top-in-1" position={Position.Top} style={{ top: '16.7%', left: '25.4%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-2" position={Position.Top} style={{ top: '16.7%', left: '76.1%' }} title="OUT-2" />
                    <BaseHandle type="target" id="top-in-2" position={Position.Top} style={{ top: '16.7%', left: '76.1%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-3" position={Position.Top} style={{ top: '16.7%', left: '84.1%' }} title="OUT-3" />
                    <BaseHandle type="target" id="top-in-3" position={Position.Top} style={{ top: '16.7%', left: '84.1%' }} title="OUT-3 (IN)" opacity={0} />
                </>
            );
        case 'yaxisheader':
            return (
                <>
                    <BaseHandle type="target" id="left-out-1" position={Position.Left} style={{ top: '26.1%' }} title="OUT-1" />
                    <BaseHandle type="source" id="left-out-1-src" position={Position.Left} style={{ top: '26.1%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="target" id="left-out-2" position={Position.Left} style={{ top: '70.9%' }} title="OUT-2" />
                    <BaseHandle type="source" id="left-out-2-src" position={Position.Left} style={{ top: '70.9%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-in" position={Position.Right} style={{ top: '48.5%' }} title="IN" />
                    <BaseHandle type="target" id="right-in-tgt" position={Position.Right} style={{ top: '48.5%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="top-out" position={Position.Top} style={{ left: '50%' }} title="TOP" />
                    <BaseHandle type="target" id="top-in" position={Position.Top} style={{ left: '50%' }} title="TOP (IN)" opacity={0} />
                </>
            );
        case 'yaxisheader1in5out':
            return (
                <>
                    <BaseHandle type="target" id="left-in" position={Position.Left} style={{ top: '48.5%' }} title="IN" />
                    <BaseHandle type="source" id="left-in-src" position={Position.Left} style={{ top: '48.5%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="right-out-1" position={Position.Right} style={{ top: '11.2%' }} title="OUT-1" />
                    <BaseHandle type="target" id="right-out-1-tgt" position={Position.Right} style={{ top: '11.2%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-2" position={Position.Right} style={{ top: '29.9%' }} title="OUT-2" />
                    <BaseHandle type="target" id="right-out-2-tgt" position={Position.Right} style={{ top: '29.9%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-3" position={Position.Right} style={{ top: '48.5%' }} title="OUT-3" />
                    <BaseHandle type="target" id="right-out-3-tgt" position={Position.Right} style={{ top: '48.5%' }} title="OUT-3 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-4" position={Position.Right} style={{ top: '67.2%' }} title="OUT-4" />
                    <BaseHandle type="target" id="right-out-4-tgt" position={Position.Right} style={{ top: '67.2%' }} title="OUT-4 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-5" position={Position.Right} style={{ top: '85.8%' }} title="OUT-5" />
                    <BaseHandle type="target" id="right-out-5-tgt" position={Position.Right} style={{ top: '85.8%' }} title="OUT-5 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out" position={Position.Top} style={{ left: '50%' }} title="TOP" />
                    <BaseHandle type="target" id="top-in" position={Position.Top} style={{ left: '50%' }} title="TOP (IN)" opacity={0} />
                </>
            );
        case 'h2header4way':
            return (
                <>
                    <BaseHandle type="source" id="left-out-1" position={Position.Left} style={{ top: '32.4%' }} title="OUT-1" />
                    <BaseHandle type="target" id="left-in-1" position={Position.Left} style={{ top: '32.4%' }} title="IN-1" opacity={0} />
                    <BaseHandle type="source" id="left-out-2" position={Position.Left} style={{ top: '67.6%' }} title="OUT-2" />
                    <BaseHandle type="target" id="left-in-2" position={Position.Left} style={{ top: '67.6%' }} title="IN-2" opacity={0} />
                    <BaseHandle type="target" id="right-in" position={Position.Right} style={{ top: '50%' }} title="IN" />
                    <BaseHandle type="source" id="right-out" position={Position.Right} style={{ top: '50%' }} title="OUT" opacity={0} />
                    <BaseHandle type="source" id="top-out" position={Position.Top} style={{ left: '50%' }} title="TOP OUT" />
                    <BaseHandle type="target" id="top-in" position={Position.Top} style={{ left: '50%' }} title="TOP IN" opacity={0} />
                </>
            );
        case 'xaxisheader1out4':
            return (
                <>
                    <BaseHandle type="target" id="bottom-in" position={Position.Bottom} style={{ left: '50%' }} title="IN" />
                    <BaseHandle type="source" id="bottom-in-src" position={Position.Bottom} style={{ left: '50%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="top-out-1" position={Position.Top} style={{ top: '16.7%', left: '10%' }} title="OUT-1" />
                    <BaseHandle type="target" id="top-in-1" position={Position.Top} style={{ top: '16.7%', left: '10%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-2" position={Position.Top} style={{ top: '16.7%', left: '36.7%' }} title="OUT-2" />
                    <BaseHandle type="target" id="top-in-2" position={Position.Top} style={{ top: '16.7%', left: '36.7%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-3" position={Position.Top} style={{ top: '16.7%', left: '63.3%' }} title="OUT-3" />
                    <BaseHandle type="target" id="top-in-3" position={Position.Top} style={{ top: '16.7%', left: '63.3%' }} title="OUT-3 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-4" position={Position.Top} style={{ top: '16.7%', left: '90%' }} title="OUT-4" />
                    <BaseHandle type="target" id="top-in-4" position={Position.Top} style={{ top: '16.7%', left: '90%' }} title="OUT-4 (IN)" opacity={0} />
                </>
            );
        case 'xaxisheader1in3out':
            return (
                <>
                    <BaseHandle type="target" id="bottom-in" position={Position.Bottom} style={{ left: '50%' }} title="IN" />
                    <BaseHandle type="source" id="bottom-in-src" position={Position.Bottom} style={{ left: '50%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="top-out-1" position={Position.Top} style={{ top: '16.7%', left: '20%' }} title="OUT-1" />
                    <BaseHandle type="target" id="top-in-1" position={Position.Top} style={{ top: '16.7%', left: '20%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-2" position={Position.Top} style={{ top: '16.7%', left: '50%' }} title="OUT-2" />
                    <BaseHandle type="target" id="top-in-2" position={Position.Top} style={{ top: '16.7%', left: '50%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="top-out-3" position={Position.Top} style={{ top: '16.7%', left: '80%' }} title="OUT-3" />
                    <BaseHandle type="target" id="top-in-3" position={Position.Top} style={{ top: '16.7%', left: '80%' }} title="OUT-3 (IN)" opacity={0} />
                </>
            );
        case 'xaxisheader1in5out':
            return (
                <>
                    <BaseHandle type="target" id="top-in" position={Position.Top} style={{ left: '50%' }} title="IN" />
                    <BaseHandle type="source" id="top-in-src" position={Position.Top} style={{ left: '50%' }} title="IN (OUT)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out-1" position={Position.Bottom} style={{ left: '10%' }} title="OUT-1" />
                    <BaseHandle type="target" id="bottom-out-1-tgt" position={Position.Bottom} style={{ left: '10%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out-2" position={Position.Bottom} style={{ left: '30%' }} title="OUT-2" />
                    <BaseHandle type="target" id="bottom-out-2-tgt" position={Position.Bottom} style={{ left: '30%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out-3" position={Position.Bottom} style={{ left: '50%' }} title="OUT-3" />
                    <BaseHandle type="target" id="bottom-out-3-tgt" position={Position.Bottom} style={{ left: '50%' }} title="OUT-3 (IN)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out-4" position={Position.Bottom} style={{ left: '70%' }} title="OUT-4" />
                    <BaseHandle type="target" id="bottom-out-4-tgt" position={Position.Bottom} style={{ left: '70%' }} title="OUT-4 (IN)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out-5" position={Position.Bottom} style={{ left: '90%' }} title="OUT-5" />
                    <BaseHandle type="target" id="bottom-out-5-tgt" position={Position.Bottom} style={{ left: '90%' }} title="OUT-5 (IN)" opacity={0} />
                </>
            );
        case 'yaxisheader4in3out':
            return (
                <>
                    <BaseHandle type="target" id="left-in-1" position={Position.Left} style={{ top: '27.8%' }} title="IN-1" />
                    <BaseHandle type="source" id="left-in-1-src" position={Position.Left} style={{ top: '27.8%' }} title="IN-1 (OUT)" opacity={0} />
                    <BaseHandle type="target" id="left-in-2" position={Position.Left} style={{ top: '50%' }} title="IN-2" />
                    <BaseHandle type="source" id="left-in-2-src" position={Position.Left} style={{ top: '50%' }} title="IN-2 (OUT)" opacity={0} />
                    <BaseHandle type="target" id="left-in-3" position={Position.Left} style={{ top: '72.2%' }} title="IN-3" />
                    <BaseHandle type="source" id="left-in-3-src" position={Position.Left} style={{ top: '72.2%' }} title="IN-3 (OUT)" opacity={0} />
                    <BaseHandle type="source" id="right-out-1" position={Position.Right} style={{ top: '16.7%' }} title="OUT-1" />
                    <BaseHandle type="target" id="right-out-1-tgt" position={Position.Right} style={{ top: '16.7%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-2" position={Position.Right} style={{ top: '38.9%' }} title="OUT-2" />
                    <BaseHandle type="target" id="right-out-2-tgt" position={Position.Right} style={{ top: '38.9%' }} title="OUT-2 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-3" position={Position.Right} style={{ top: '61.1%' }} title="OUT-3" />
                    <BaseHandle type="target" id="right-out-3-tgt" position={Position.Right} style={{ top: '61.1%' }} title="OUT-3 (IN)" opacity={0} />
                    <BaseHandle type="source" id="right-out-4" position={Position.Right} style={{ top: '83.3%' }} title="OUT-4" />
                    <BaseHandle type="target" id="right-out-4-tgt" position={Position.Right} style={{ top: '83.3%' }} title="OUT-4 (IN)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out" position={Position.Bottom} style={{ left: '50%' }} title="BOTTOM" />
                    <BaseHandle type="target" id="bottom-in" position={Position.Bottom} style={{ left: '50%' }} title="BOTTOM (IN)" opacity={0} />
                </>
            );
        case 'verticalheader4waycustom':
            return (
                <>
                    <BaseHandle type="source" id="left-out-1" position={Position.Left} style={{ top: '50%' }} title="OUT-1" />
                    <BaseHandle type="target" id="left-in-1" position={Position.Left} style={{ top: '50%' }} title="OUT-1 (IN)" opacity={0} />
                    <BaseHandle type="target" id="right-in-1" position={Position.Right} style={{ top: '32.5%' }} title="IN-1" />
                    <BaseHandle type="source" id="right-out-1" position={Position.Right} style={{ top: '32.5%' }} title="IN-1 (OUT)" opacity={0} />
                    <BaseHandle type="target" id="right-in-2" position={Position.Right} style={{ top: '67.5%' }} title="IN-2" />
                    <BaseHandle type="source" id="right-out-2" position={Position.Right} style={{ top: '67.5%' }} title="IN-2 (OUT)" opacity={0} />
                    <BaseHandle type="source" id="bottom-out" position={Position.Bottom} style={{ left: '50%' }} title="BOTTOM" />
                    <BaseHandle type="target" id="bottom-in" position={Position.Bottom} style={{ left: '50%' }} title="BOTTOM (IN)" opacity={0} />
                </>
            );
        default:
            return (
                <>
                    <BaseHandle type="target" id="top" position={Position.Top} />
                    <BaseHandle type="source" id="top-src" position={Position.Top} opacity={0} />
                    <BaseHandle type="source" id="bottom" position={Position.Bottom} />
                    <BaseHandle type="target" id="bottom-tgt" position={Position.Bottom} opacity={0} />
                    <BaseHandle type="source" id="right" position={Position.Right} />
                    <BaseHandle type="target" id="right-tgt" position={Position.Right} opacity={0} />
                    <BaseHandle type="target" id="left" position={Position.Left} />
                    <BaseHandle type="source" id="left-src" position={Position.Left} opacity={0} />
                </>
            );
    }
}
