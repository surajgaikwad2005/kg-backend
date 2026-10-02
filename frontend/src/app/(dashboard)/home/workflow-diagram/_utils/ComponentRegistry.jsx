'use client';
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
import H2Header3 from '@/src/components/diagrams/custom/H2Header3';
import H2Header3_2In1Out from '@/src/components/diagrams/custom/H2header3in2out';
import HydrocrackerBox from '@/src/components/diagrams/custom/HydroCrackerBox';
import XAxisHeader from '@/src/components/diagrams/custom/XAxisheader';
import YAxisHeader from '@/src/components/diagrams/custom/Yaxisheader';
import YAxisHeader1In5Out from '@/src/components/diagrams/custom/YAxisHeader1In5Out';
import H2Header4Way from '@/src/components/diagrams/custom/H2Header4Way';
import XAxisHeader1In4Out from '@/src/components/diagrams/custom/XAxisHeader1out4';
import YAxisHeader3In4Out from '@/src/components/diagrams/custom/YAxisHeader4In3Out';
import XAxisHeader1In5Out from '@/src/components/diagrams/custom/XAxisHeader1In5Out';
import VerticalHeader4WayCustom from '@/src/components/diagrams/custom/VerticalHeader4WayCustom';
import XAxisHeader1In3Out from '@/src/components/diagrams/custom/XAxisHeader1In3Out';

const noop = () => {};

const REGISTRY = {
    'xaxisheader1in3out': { component: XAxisHeader1In3Out, viewBox: '0 0 1020 180', size: { w: 1000, h: 180 } },
    'verticalheader4waycustom': { component: VerticalHeader4WayCustom, viewBox: '0 0 250 400', size: { w: 250, h: 400 } },
    'xaxisheader1in5out': { component: XAxisHeader1In5Out, viewBox: '0 0 3020 180', size: { w: 3000, h: 180 } },
    'cementmill': { component: CementMill, viewBox: '-20 -20 360 200', size: { w: 280, h: 200 } },
    'checkvalve': { component: CheckValve, viewBox: '-20 -20 90 90', size: { w: 100, h: 100 } },
    'hpseparator': { component: HpSeparator, viewBox: '0 -10 125 275', size: { w: 120, h: 220 } },
    'coalescer': { component: Coalescer, viewBox: '-20 -25 180 170', size: { w: 180, h: 170 } },
    'crusher': { component: Crusher, viewBox: '-10 -20 280 200', size: { w: 250, h: 180 } },
    'kiln': { component: Kiln, viewBox: '-10 -20 280 200', size: { w: 250, h: 180 } },
    'rawmill': { component: RawMill, viewBox: '-20 -20 360 200', size: { w: 280, h: 200 } },
    'preheater': { component: Preheater, viewBox: '-10 -20 180 260', size: { w: 180, h: 240 } },
    'cooler': { component: Cooler, viewBox: '-10 -10 200 100', size: { w: 200, h: 120 } },
    'lpseparator': { component: LpSeparator, viewBox: '0 -10 115 185', size: { w: 110, h: 170 } },
    'tegunit': { component: TegUnit, viewBox: '-10 -10 130 130', size: { w: 130, h: 130 } },
    'wellmanifold': { component: WellManifold, viewBox: '-10 -10 200 100', size: { w: 200, h: 100 } },
    'wellhead': { component: Wellhead, viewBox: '-10 -10 100 140', size: { w: 100, h: 140 } },
    'watertreatment': { component: WaterTreatment, viewBox: '-10 -10 140 140', size: { w: 140, h: 140 } },
    'suctionscrubber': { component: SuctionScrubber, viewBox: '-10 -15 85 155', size: { w: 85, h: 140 } },
    'exportcompressor': { component: ExportCompressor, viewBox: '-5 -10 120 100', size: { w: 120, h: 100 } },
    'exportpipeline': { component: ExportPipeline, viewBox: '-10 -10 240 80', size: { w: 240, h: 80 } },
    'fivestagepreheaterwithprecalciner': { component: FiveStagePreheaterWithPrecalciner, viewBox: '0 -60 320 660', size: { w: 300, h: 620 } },
    '5stagepreheaterwithprecalciner': { component: FiveStagePreheaterWithPrecalciner, viewBox: '0 -60 320 660', size: { w: 300, h: 620 } },
    'h2header5': { component: H2Header5, viewBox: '0 0 250 350', size: { w: 250, h: 350 } },
    'h2header': { component: H2Header3, viewBox: '0 0 250 250', size: { w: 250, h: 250 } },
    'h2header2in1out': { component: H2Header3_2In1Out, viewBox: '0 0 250 250', size: { w: 250, h: 250 } },
    'hydrocracker': { component: HydrocrackerBox, viewBox: '0 0 160 45', size: { w: 160, h: 45 } },
    'xaxisheader': { component: XAxisHeader, viewBox: '0 0 1400 180', size: { w: 1380, h: 180 } },
    'yaxisheader': { component: YAxisHeader, viewBox: '0 0 250 340', size: { w: 250, h: 340 } },
    'yaxisheader1in5out': { component: YAxisHeader1In5Out, viewBox: '0 0 250 1340', size: { w: 250, h: 1340 } },
    'h2header4way': { component: H2Header4Way, viewBox: '0 0 250 340', size: { w: 250, h: 340 } },
    'xaxisheader1out4': { component: XAxisHeader1In4Out, viewBox: '0 0 1520 180', size: { w: 1500, h: 180 } },
    'yaxisheader4in3out': { component: YAxisHeader3In4Out, viewBox: '0 0 250 900', size: { w: 250, h: 900 } },
};

function normalize(name) {
    return name.toLowerCase().replace(/[\s_-]+/g, '');
}

export function lookupEntry(equipmentName) {
    return REGISTRY[normalize(equipmentName)] || null;
}

export function lookupComponent(equipmentName) {
    const entry = lookupEntry(equipmentName);
    return entry ? entry.component : null;
}
