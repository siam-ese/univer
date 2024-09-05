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

import type { ChartBorderDashType, DeepPartial, ISeriesStyle } from '@univerjs/chart';
import { ChartTypeBits, defaultChartStyle } from '@univerjs/chart';
import { Select } from '@univerjs/design';

import type { Nullable } from '@univerjs/core';
import type { SheetsChartUIService } from '../services/sheets-chart-ui.service';
import { useChartConfigState } from '../hooks';
import { borderDashTypeOptions, borderWidthOptions, getAllSeriesOption, lineOpacityOptions, seriesChartTypeOptions } from './options';
import { ColorPickerControl } from './color-picker-control';
import { DataLabelOptions } from './DataLabelOptions';

export interface ISeriesStyleEditProps {
    chartType: Nullable<ChartTypeBits>;
    service: SheetsChartUIService;
}

export const SeriesStyleEdit = (props: ISeriesStyleEditProps) => {
    const { chartType, service } = props;
    const [allSeriesStyle, setAllSeriesStyle] = useChartConfigState('allSeriesStyle', service);
    const [seriesStyleMap] = useChartConfigState('seriesStyleMap', service);
    const [seriesList] = useChartConfigState('seriesList', service);
    const firstSeries = seriesList?.sort((a, b) => Number(a.value) - Number(b.value))[0];
    // const [currentAxisId, setCurrentAxisId] = useState<string>(axisListOptions[0].value);
    const [currentSeriesId, setCurrentSeriesId] = useState<string>(defaultChartStyle.allSeriesId);
    const seriesOptions = useMemo(() => seriesList ? [getAllSeriesOption(), ...seriesList] : [], [seriesList]);

    const defaultBorderStyle = defaultChartStyle.borderStyle;

    const isAllSeriesStyle = currentSeriesId === defaultChartStyle.allSeriesId;
    const currentSeriesStyle = isAllSeriesStyle
        ? allSeriesStyle
        : seriesStyleMap?.get(currentSeriesId);

    const setCurrentSeriesStyle = useCallback((style: DeepPartial<ISeriesStyle>) => {
        seriesStyleMap?.set(currentSeriesId, style);
    }, [currentSeriesId, seriesStyleMap]);

    const borderStyle: ISeriesStyle['border'] = Object.assign({
        color: 'transparent',
        opacity: defaultBorderStyle.opacity,
        width: defaultBorderStyle.width,
        dashType: defaultBorderStyle.dashType,
    }, allSeriesStyle?.border, currentSeriesStyle?.border);

    const setSeriesStyle = isAllSeriesStyle ? setAllSeriesStyle : setCurrentSeriesStyle;

    const labelStyle: Partial<ISeriesStyle['label']> = isAllSeriesStyle
        ? (allSeriesStyle?.label ?? {})
        : Object.assign({}, allSeriesStyle?.label, currentSeriesStyle?.label);

    const seriesChartType = isAllSeriesStyle
        ? allSeriesStyle?.chartType
        : currentSeriesStyle?.chartType ?? (
            currentSeriesId === firstSeries?.value
                ? defaultChartStyle.combination.firstChartType
                : defaultChartStyle.combination.otherChartType
        );

    return (
        <section>
            <Select className="chart-edit-panel-select" value={currentSeriesId} onChange={(id) => setCurrentSeriesId(id)} options={seriesOptions}></Select>
            <div>
                {chartType === ChartTypeBits.Combination && (
                    <div className="chart-edit-panel-row">
                        <div className="chart-edit-panel-label">Chart type</div>
                        <Select
                            value={String(seriesChartType ?? '')}
                            options={seriesChartTypeOptions}
                            onChange={(v) => {
                                setCurrentSeriesStyle({
                                    chartType: Number(v),
                                });
                            }}
                        >
                        </Select>
                    </div>
                )}
                <div className="chart-edit-panel-row">
                    <div className="chart-edit-panel-row-half">
                        <div className="chart-edit-panel-label chart-edit-panel-top-gap">Border Color</div>
                        <ColorPickerControl color={borderStyle?.color} onChange={(color) => setSeriesStyle({ border: { color } })}></ColorPickerControl>
                    </div>
                    <div className="chart-edit-panel-row-half">
                        <div className="chart-edit-panel-label chart-edit-panel-top-gap">Border Opacity</div>
                        <Select value={String(borderStyle?.opacity)} options={lineOpacityOptions} onChange={(v) => setSeriesStyle({ border: { opacity: Number(v) } })}></Select>
                    </div>
                </div>
                <div className="chart-edit-panel-row">
                    <div className="chart-edit-panel-row-half">
                        <div className="chart-edit-panel-label chart-edit-panel-top-gap">Dash type</div>
                        <Select value={borderStyle?.dashType} options={borderDashTypeOptions} onChange={(v) => setSeriesStyle({ border: { dashType: v as ChartBorderDashType } })}></Select>
                    </div>
                    <div className="chart-edit-panel-row-half">
                        <div className="chart-edit-panel-label chart-edit-panel-top-gap">Line thickness</div>
                        <Select value={String(borderStyle?.width)} options={borderWidthOptions} onChange={(v) => setSeriesStyle({ border: { width: Number(v) } })}></Select>
                    </div>
                </div>
            </div>
            <div className="chart-edit-panel-top-gap">
                <DataLabelOptions labelStyle={labelStyle} onVisibleChange={(visible) => setSeriesStyle({ label: { visible } })} />
            </div>
        </section>
    );
};
