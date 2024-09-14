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
import type { LocaleService, Nullable } from '@univerjs/core';
import type { SheetsChartUIService } from '../services/sheets-chart-ui.service';
import { useChartConfigState } from '../hooks';
import { ColorPickerControl } from './color-picker-control';
import { pieDataLabelPositionOptions, pieDonutHoleOptions, pieLabelContentOptions } from './options';
import { DataLabelOptions } from './DataLabelOptions';
import { useTranslatedOptions } from './use-translated-options';

export const PieChartStyleEdit = (props: {
    chartType: Nullable<ChartTypeBits>;
    service: SheetsChartUIService;
    localeService: LocaleService;
    onChartTypeChange?: (chartType: ChartTypeBits) => void;
}) => {
    const { chartType, service, localeService, onChartTypeChange } = props;
    const [borderColor, setBorderColor] = useChartConfigState('pieBorderColor', service);
    const [pieLabelStyle, setPieLabelStyle] = useChartConfigState('pieLabelStyle', service);
    const defaultDoughnutHole = chartType === ChartTypeBits.Doughnut ? defaultChartStyle.pie.doughnutHole : 0;
    const [doughnutHole, setDoughnutHole] = useChartConfigState('doughnutHole', service);
    const innerPieDataLabelPositionOptions = useTranslatedOptions(localeService, pieDataLabelPositionOptions);
    const innerPieContentTypeOptions = useTranslatedOptions(localeService, pieLabelContentOptions);

    const fallbackPieLabelStyle: Partial<IPieLabelStyle> = useMemo(() => {
        return {
            visible: true,
            contentType: defaultChartStyle.pie.labelContentType,
            fontSize: defaultChartStyle.textStyle.fontSize,
            position: PieLabelPosition.Outside,
        };
    }, []);

    const handleDoughNutHoleChange = useCallback((v: string) => {
        const value = Number(v);
        const newChartType = value > 0 ? ChartTypeBits.Doughnut : ChartTypeBits.Pie;
        if (newChartType !== chartType) {
            onChartTypeChange?.(newChartType);
        }

        setDoughnutHole(value);
    }, [chartType, onChartTypeChange]);
    const { t } = localeService;
    return (
        <div>
            <div className="chart-edit-panel-row">
                <div className="chart-edit-panel-row-half">
                    <div className="chart-edit-panel-label chart-edit-panel-label-gap">{t('chart.doughnutHole')}</div>
                    <Select value={doughnutHole ? String(doughnutHole) : `${defaultDoughnutHole * 100}%`} onChange={handleDoughNutHoleChange} options={pieDonutHoleOptions}></Select>

                </div>
                <div className="chart-edit-panel-row-half">
                    <div className="chart-edit-panel-label chart-edit-panel-label-gap">{t('chart.withColor', t('chart.border'))}</div>
                    <ColorPickerControl color={borderColor ?? ''} onChange={setBorderColor} />
                </div>
            </div>
            <DataLabelOptions
                localeService={localeService}
                fallbackLabelStyle={fallbackPieLabelStyle}
                labelStyle={pieLabelStyle ?? {}}
                onVisibleChange={(visible) => setPieLabelStyle({ visible })}
                onLabelStyleChange={(name, value) => setPieLabelStyle({ [name]: value })}
                positionOptions={innerPieDataLabelPositionOptions}
                contentTypeOptions={innerPieContentTypeOptions}
            />
        </div>
    );
};
