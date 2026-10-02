import React, { forwardRef } from 'react';
import ModalMetricInput from '../ModalMetricInput';

const EquipmentSelector = forwardRef(({ selectedEquipment, setSelectedEquipment, equipmentList }, ref) => {
  return (
    <div className="py-2 border-b border-border/50">
      <label className="block text-[10px] font-bold text-text-muted tracking-[0.12em] uppercase mb-2">Selected Equipment</label>
      <div className="w-full">
        <div>
          <div className="text-[11.5px] font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
            Equipment <span className="text-[10px] text-danger font-bold">required</span>
          </div>
          <ModalMetricInput
            ref={ref}
            value={selectedEquipment}
            onChange={setSelectedEquipment}
            metricsList={equipmentList}
            placeholder="Search equipment…"
            idKey="id"
            labelKey="label"
          />
        </div>
      </div>
    </div>
  );
});

EquipmentSelector.displayName = 'EquipmentSelector';

export default EquipmentSelector;
