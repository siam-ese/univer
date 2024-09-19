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

import React, { useCallback, useMemo, useState } from 'react';
import { Checkbox, Select } from '@univerjs/design';
import type { LocaleService, Nullable } from '@univerjs/core';
import type { IGridLineStyle, IRuntimeAxis } from '@univerjs/chart';
import { IRuntimeAxisPosition, IRuntimeAxisPriority, PieLabelPosition } from '@univerjs/chart';
import { axisListOptions, defaultOption, pieDataLabelPositionOptions, tickLengthOptions, tickThicknessOptions, tickWidthOptions } from '../options';
import { ColorPickerControl } from '../color-picker-control';
import type { SheetsChartUIService } from '../../services/sheets-chart-ui.service';
import { useTranslatedOptions } from '../use-translated-options';
import { useChartConfigState } from '../../hooks';

export interface IGridLineAndTickOptionsProps {
    className?: string;
    service: SheetsChartUIService;
    localeService: LocaleService;
    runtimeAxes: Nullable<IRuntimeAxis[]>;
}

export const GridLineAndTickOptions = (props: IGridLineAndTickOptionsProps) => {
    const { runtimeAxes, localeService, service, className } = props;
    const { t } = localeService;
    const filteredAxisListOptions = useMemo(() => axisListOptions.filter((option) => {
        const hasAxis = runtimeAxes?.some((axis) => axis.position === IRuntimeAxisPosition.Right);
        if (option.value === 'rightYAxis') {
            return hasAxis;
        }
        return true;
    }), [runtimeAxes]);

    const innerAxisListOptions = useTranslatedOptions(localeService, filteredAxisListOptions);

    const secondaryAxis = useMemo(() => runtimeAxes?.find((axis) => axis.priority === IRuntimeAxisPriority.Secondary), [runtimeAxes]);
    const [currentAxisId, setCurrentAxisId] = useState<string>(axisListOptions[0].value);
    const [xAxisOptions, setXAxisOptions] = useChartConfigState('xAxisOptions', service);
    const [yAxisOptions, setYAxisOptions] = useChartConfigState('yAxisOptions', service);
    const [rightYAxisOptions, setRightYAxisOptions] = useChartConfigState('rightYAxisOptions', service);

    const currentAxisOptions = {
        xAxis: xAxisOptions,
        yAxis: yAxisOptions,
        rightYAxis: rightYAxisOptions,
    }[currentAxisId];

    const setAxisOptions = {
        xAxis: setXAxisOptions,
        yAxis: setYAxisOptions,
        rightYAxis: setRightYAxisOptions,
    }[currentAxisId];

    const axisPosition = {
        xAxis: 'bottom',
        yAxis: 'left',
        rightYAxis: 'right',
    }[currentAxisId];

    const tickStyle = currentAxisOptions?.tick;

    const gridLineStyle = currentAxisOptions?.gridLine;
    const setGridLineStyle = useCallback((gridLineStyle: Partial<IGridLineStyle>) => {
        setAxisOptions?.({ gridLine: gridLineStyle });
    }, [setAxisOptions]);

    const { visible: _visible, color, width } = gridLineStyle ?? {};
    const visible = _visible ?? secondaryAxis?.position === axisPosition;

    const innerTickPositionOptions = useTranslatedOptions(localeService, pieDataLabelPositionOptions);

    const innerTickLengthOptions = useMemo(() => {
        defaultOption.label = t(defaultOption.label);

        return [defaultOption, ...tickLengthOptions];
    }, [t]);
    const innerTickWidthOptions = useMemo(() => {
        defaultOption.label = t(defaultOption.label);

        return [defaultOption, ...tickWidthOptions];
    }, [t]);

    return (
        <div className={className}>
            <div className="chart-edit-panel-top-gap">
                {/* <h5>Select one</h5> */}
                <Select className="chart-edit-panel-select" options={innerAxisListOptions} value={currentAxisId} onChange={setCurrentAxisId}></Select>
            </div>

            <div className="chart-edit-panel-row chart-edit-panel-top-gap">
                <div className="chart-edit-panel-row-half">
                    <Checkbox checked={visible} onChange={(checked) => setGridLineStyle?.({ visible: Boolean(checked) })}>{t('chart.gridlines.majorGridlines')}</Checkbox>
                </div>
                {visible && (
                    <>
                        <div className="chart-edit-panel-row-half">
                            <h5>
                                {t('chart.gridlines.text')}
                                {' '}
                                {t('chart.color')}
                            </h5>
                            <ColorPickerControl color={color ?? ''} onChange={(c) => setGridLineStyle?.({ color: c })} />
                        </div>
                        <div className="chart-edit-panel-row-half">
                            <h5>
                                {t('chart.withThickness', t('chart.gridlines.text'))}
                            </h5>
                            <Select value={String(width ?? '')} onChange={(w) => setGridLineStyle?.({ width: Number(w) })} options={tickThicknessOptions}></Select>
                        </div>
                    </>
                )}

            </div>

            <div>
                <div>
                    <Checkbox checked={tickStyle?.visible} onChange={(checked) => setAxisOptions?.({ tick: { visible: Boolean(checked) } })}>{t('chart.ticks.majorTick')}</Checkbox>
                </div>
                <div>
                    <div className="chart-edit-panel-row">

                        <div className="chart-edit-panel-row-half">
                            <h5>{t('chart.ticks.tickPosition')}</h5>
                            <Select value={tickStyle?.position ?? PieLabelPosition.Outside} options={innerTickPositionOptions} onChange={(v) => setAxisOptions?.({ tick: { position: v as PieLabelPosition } })}></Select>

                        </div>
                        <div className="chart-edit-panel-row-half">
                            <h5>{t('chart.ticks.tickLength')}</h5>
                            <Select value={String(tickStyle?.length ?? defaultOption.value)} options={innerTickLengthOptions} onChange={(v) => setAxisOptions?.({ tick: { length: v === defaultOption.value ? undefined : Number(v) } })}></Select>
                        </div>
                    </div>
                    <div className="chart-edit-panel-row">
                        <div className="chart-edit-panel-row-half">
                            <h5>{t('chart.withThickness', t('chart.line'))}</h5>
                            <Select value={String(tickStyle?.lineWidth ?? defaultOption.value)} options={innerTickWidthOptions} onChange={(v) => setAxisOptions?.({ tick: { lineWidth: v === defaultOption.value ? undefined : Number(v) } })}></Select>
                        </div>
                        <div className="chart-edit-panel-row-half">
                            <ColorPickerControl color={tickStyle?.lineColor ?? ''} onChange={(c) => setAxisOptions?.({ tick: { lineColor: c } })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
