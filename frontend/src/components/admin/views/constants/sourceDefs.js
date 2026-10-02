import { FileCode, FileStack, History, Server } from 'lucide-react';

export const SOURCE_DEFS = [
    { type: 'P&ID',                 icon: FileCode,  label: 'P&ID' },
    { type: 'Documents',            icon: FileStack, label: 'Documents' },
    { type: 'Historian/Timeseries', icon: History,   label: 'Historian' },
    { type: 'SAP',                  icon: Server,    label: 'SAP' },
];
