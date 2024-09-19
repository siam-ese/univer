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

import type { DeepPartial, IAxisOptions } from '@univerjs/chart';
import { defaultChartStyle } from '@univerjs/chart';
import type { LocaleService } from '@univerjs/core';
import { Checkbox, InputNumber } from '@univerjs/design';
import React, { useState } from 'react';
import { FontFormatBar } from './font-format-bar';

export interface IAxisOptionsEditProps {
    localeService: LocaleService;
    valueAxis: boolean;
    axisOptions: DeepPartial<IAxisOptions>;
    onChange?: (axisOptions: DeepPartial<IAxisOptions>) => void;
}

export const AxisOptionsEdit = (props: IAxisOptionsEditProps) => {
    const { localeService, valueAxis, axisOptions, onChange } = props;
    const { t } = localeService;
    const [yAxisMax, setYAxisMax] = useState(axisOptions?.max);
    const [yAxisMin, setYAxisMin] = useState(axisOptions?.min);

    return (
        <section>

            <h5>{t('chart.axes.axisOptions')}</h5>
            <div>
                <div className="chart-edit-panel-row">
                    <Checkbox className="chart-edit-panel-row-half" checked={axisOptions?.label?.visible ?? defaultChartStyle.axis.labelVisible} onChange={(checked) => onChange?.({ label: { visible: Boolean(checked) } })}>{t('chart.styleEditPanel.showLabels')}</Checkbox>
                    {!valueAxis && (
                        <Checkbox className="chart-edit-panel-row-half" checked={axisOptions?.reverse ?? defaultChartStyle.axis.reverse} onChange={(checked) => onChange?.({ reverse: Boolean(checked) })}>{t('chart.styleEditPanel.reverseAxisOrder')}</Checkbox>

                    )}
                </div>
                <Checkbox className="chart-edit-panel-top-gap" checked={axisOptions?.lineVisible ?? defaultChartStyle.axis.lineVisible} onChange={(checked) => onChange?.({ lineVisible: Boolean(checked) })}>{t('chart.styleEditPanel.showAxisLine')}</Checkbox>
            </div>
            <FontFormatBar
                className="chart-edit-panel-top-gap"
                {...axisOptions?.label}
                localeService={localeService}
                fontSize={axisOptions?.label?.fontSize ?? defaultChartStyle.textStyle.fontSize}
                color={axisOptions?.label?.color ?? defaultChartStyle.textStyle.color}
                onChange={(name, value) => onChange?.({ label: { [name]: value } })}
            />
            {valueAxis && (
                <div className="chart-edit-panel-row">
                    <div className="chart-edit-panel-row-half">
                        <div>{t('chart.min')}</div>
                        <InputNumber
                            controls={false}
                            value={yAxisMin}
                            onChange={(v) => setYAxisMin(v ?? undefined)}
                            onBlur={() => onChange?.({ min: yAxisMin })}
                            onPressEnter={() => onChange?.({ min: yAxisMin })}
                        >
                        </InputNumber>
                    </div>
                    <div className="chart-edit-panel-row-half">
                        <div>{t('chart.max')}</div>
                        <InputNumber
                            controls={false}
                            value={yAxisMax}
                            onChange={(v) => setYAxisMax(v ?? undefined)}
                            onBlur={() => onChange?.({ max: yAxisMax })}
                            onPressEnter={() => onChange?.({ max: yAxisMax })}
                        >
                        </InputNumber>
                    </div>
                </div>
            )}
        </section>
    );
};
