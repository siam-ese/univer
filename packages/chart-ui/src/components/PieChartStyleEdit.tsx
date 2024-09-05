/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Select } from '@univerjs/design';
import React, { useCallback, useMemo } from 'react';
import type { IPieLabelStyle } from '@univerjs/chart';
import { ChartTypeBits, defaultChartStyle, PieLabelPosition } from '@univerjs/chart';
import type { Nullable } from '@univerjs/core';
import type { SheetsChartUIService } from '../services/sheets-chart-ui.service';
import { useChartConfigState } from '../hooks';
import { ColorPickerControl } from './color-picker-control';
import { pieDataLabelPositionOptions, pieDonutHoleOptions, pieLabelContentOptions } from './options';
import { DataLabelOptions } from './DataLabelOptions';

export const PieChartStyleEdit = (props: {
    chartType: Nullable<ChartTypeBits>;
    service: SheetsChartUIService;
}) => {
    const { chartType, service } = props;
    const [borderColor, setBorderColor] = useChartConfigState('borderColor', service);
    const [pieLabelStyle, setPieLabelStyle] = useChartConfigState('pieLabelStyle', service);
    const defaultDoughnutHole = chartType === ChartTypeBits.Doughnut ? defaultChartStyle.pie.doughnutHole : 0;
    const [doughnutHole, setDoughnutHole] = useChartConfigState('doughnutHole', service);

    const fallbackPieLabelStyle: Partial<IPieLabelStyle> = useMemo(() => {
        return {
            visible: true,
            contentType: defaultChartStyle.pie.labelContentType,
            fontSize: defaultChartStyle.textStyle.labelFontSize,
            position: PieLabelPosition.Outside,
        };
    }, []);

    const handleDoughNutHoleChange = useCallback((v: string) => {
        const value = Number(v);
        const newChartType = value > 0 ? ChartTypeBits.Doughnut : ChartTypeBits.Pie;
        if (newChartType !== chartType) {
            setChartType(newChartType);
        }

        setDoughnutHole(value);
    }, [chartType]);

    return (
        <div>
            <div className="chart-edit-panel-row">
                <div className="chart-edit-panel-row-half">
                    <div className="chart-edit-panel-label chart-edit-panel-label-gap">Doughnut hold</div>
                    <Select value={doughnutHole ? String(doughnutHole) : `${defaultDoughnutHole * 100}%`} onChange={handleDoughNutHoleChange} options={pieDonutHoleOptions}></Select>

                </div>
                <div className="chart-edit-panel-row-half">
                    <div className="chart-edit-panel-label chart-edit-panel-label-gap">Border color</div>
                    <ColorPickerControl color={borderColor ?? ''} onChange={setBorderColor} />
                </div>
            </div>
            <DataLabelOptions
                fallbackLabelStyle={fallbackPieLabelStyle}
                labelStyle={pieLabelStyle ?? {}}
                onVisibleChange={(visible) => setPieLabelStyle({ visible })}
                onLabelStyleChange={(name, value) => setPieLabelStyle({ [name]: value })}
                positionOptions={pieDataLabelPositionOptions}
                contentTypeOptions={pieLabelContentOptions}
            />
        </div>
    );
};
