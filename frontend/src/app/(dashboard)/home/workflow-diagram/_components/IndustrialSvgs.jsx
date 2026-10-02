'use client';

import React from 'react';

import CementMill from '@/src/components/diagrams/cement-mill/Cementmill';
import CheckValve from '@/src/components/diagrams/shared/CheckValve';
import HpSeparator from '@/src/components/diagrams/cement-mill/HpSeparator';
import Coalescer from '@/src/components/diagrams/compressor/Coalescer';
import Crusher from '@/src/components/diagrams/shared/Crusher';
import Kiln from '@/src/components/diagrams/kiln/Kiln';
import RawMill from '@/src/components/diagrams/raw-mill/RawMill';
import Preheater from '@/src/components/diagrams/kiln/Preheater';
import Cooler from '@/src/components/diagrams/kiln/Cooler';
import LpSeparator from '@/src/components/diagrams/raw-mill/LpSeparator';
import TegUnit from '@/src/components/diagrams/teg/TegUnit';
import WellManifold from '@/src/components/diagrams/well/WellManifold';
import Wellhead from '@/src/components/diagrams/well/Wellhead';
import WaterTreatment from '@/src/components/diagrams/shared/WaterTreatment';
import SuctionScrubber from '@/src/components/diagrams/compressor/SuctionScrubber';
import ExportCompressor from '@/src/components/diagrams/compressor/ExportCompressor';
import ExportPipeline from '@/src/components/diagrams/compressor/ExportPipeline';
import FiveStagePreheaterWithPrecalciner from '@/src/components/diagrams/custom/FiveStagePreheaterWithPrecalciner';
import H2Header5 from '@/src/components/diagrams/custom/H2Header5';
import TerminalBoxU418 from '@/src/components/diagrams/custom/U418';
import U402 from '@/src/components/diagrams/custom/U402';
import H2Header3 from '@/src/components/diagrams/custom/H2Header3';
import H2Header3_2In1Out from '@/src/components/diagrams/custom/H2header3in2out';
import HydrocrackerBox from '@/src/components/diagrams/custom/HydroCrackerBox';
import XAxisHeader from '@/src/components/diagrams/custom/XAxisheader';
import YAxisHeader from '@/src/components/diagrams/custom/Yaxisheader';
import LongLShapedHeader from '@/src/components/diagrams/custom/LongLShapedHeader';
import YAxisHeader1In5Out from '@/src/components/diagrams/custom/YAxisHeader1In5Out';
import H2Header4Way from '@/src/components/diagrams/custom/H2Header4Way';
import XAxisHeader1In4Out from '@/src/components/diagrams/custom/XAxisHeader1out4';
import YAxisHeader3In4Out from '@/src/components/diagrams/custom/YAxisHeader4In3Out';
import XAxisHeader1In5Out from '@/src/components/diagrams/custom/XAxisHeader1In5Out';
import VerticalHeader4WayCustom from '@/src/components/diagrams/custom/VerticalHeader4WayCustom';
import XAxisHeader1In3Out from '@/src/components/diagrams/custom/XAxisHeader1In3Out';
import XAxisHeader1In1Out from '@/src/components/diagrams/custom/XAxisHeader1In1Out';

const noop = () => {};

const EquipmentThumbnail = ({ Component, status, label }) => (
    <svg
        viewBox="0 0 350 250"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
    >
        <g transform="translate(50, 40)">
            <Component x={0} y={0} status={status} label={label} name={label} onPointerDown={noop} />
        </g>
    </svg>
);

export const COMPONENT_MAP = {
    cementmill: CementMill,
    check_valve: CheckValve,
    hp_separator: HpSeparator,
    coalescer: Coalescer,
    crusher: Crusher,
    kiln: Kiln,
    rawmill: RawMill,
    preheater: Preheater,
    cooler: Cooler,
    lp_separator: LpSeparator,
    tegunit: TegUnit,
    well_manifold: WellManifold,
    wellhead: Wellhead,
    water_treatment: WaterTreatment,
    suction_scrubber: SuctionScrubber,
    export_compressor: ExportCompressor,
    export_pipeline: ExportPipeline,
    five_stage_preheater_with_precalciner: FiveStagePreheaterWithPrecalciner,
    h2_header_5: H2Header5,
    terminal_box_u418: TerminalBoxU418,
    u_402: U402,
    h2_header: H2Header3,
    h2_header_2in_1out: H2Header3_2In1Out,
    hydrocracker: HydrocrackerBox,
    x_axis_header: XAxisHeader,
    y_axis_header: YAxisHeader,
    longLShapedHeader: LongLShapedHeader,
    y_axis_header_1in_5out: YAxisHeader1In5Out,
    h2_header_4way: H2Header4Way,
    xaxisheader1out4: XAxisHeader1In4Out,
    y_axis_header_4in_3out: YAxisHeader3In4Out,
    x_axis_header_1in5out: XAxisHeader1In5Out,
    VerticalHeader4WayCustom: VerticalHeader4WayCustom,
    XAxisHeader1In3Out: XAxisHeader1In3Out,
    XAxisHeader1In1Out: XAxisHeader1In1Out,
};

const formatLabel = (id) =>
    id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export const COMPONENT_CATALOG = Object.fromEntries(
    Object.entries(COMPONENT_MAP)
        .filter(([id]) => !id.includes('detailed_diagram') && !id.includes('detailed_view'))
        .map(([id, Component]) => [
            id,
            {
                viewBox: '0 0 250 200',
                label: formatLabel(id),
                desc: 'Industrial Equipment Unit',
                color: 'border-border-strong',
                render: (status, label) => (
                    <EquipmentThumbnail Component={Component} status={status} label={label} />
                ),
            },
        ])
);

export const NODE_SIZES = Object.fromEntries(
    Object.keys(COMPONENT_MAP).map(id => [
        id,
        id === 'common_shaft' ? { w: 50, h: 410 } :
        id === 'hp_separator' ? { w: 125, h: 275 } :
        id === 'lp_separator' ? { w: 115, h: 185 } :
        id === 'scrubber_c2210' ? { w: 70, h: 150 } :
        id === 'suction_scrubber' ? { w: 85, h: 155 } :
        id === 'five_stage_preheater_with_precalciner' ? { w: 250, h: 500 } :
        id === 'h2_header_5' || id === 'h2_header_4way' ? { w: 250, h: 340 } :
        id === 'x_axis_header' ? { w: 1380, h: 180 } :
        id === 'xaxisheader1out4' ? { w: 1500, h: 180 } :
        id === 'x_axis_header_1in5out' ? { w: 3000, h: 180 } :
        id === 'XAxisHeader1In3Out' ? { w: 1000, h: 180 } :
        id === 'VerticalHeader4WayCustom' ? { w: 250, h: 400 } :
        id === 'y_axis_header' ? { w: 250, h: 340 } :
        id === 'y_axis_header_1in_5out' ? { w: 250, h: 1340 } :
        id === 'y_axis_header_4in_3out' ? { w: 250, h: 900 } :
        id === 'hydrocracker' ? { w: 160, h: 45 } :
        id === 'h2_header' ? { w: 250, h: 250 } :
        id === 'h2_header_2in_1out' ? { w: 250, h: 250 } :
        { w: 250, h: 200 },
    ])
);
