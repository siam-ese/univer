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

import React from 'react';

import type { DeepPartial, ISeriesStyle } from '@univerjs/chart';
import { ChartTypeBits, defaultChartStyle } from '@univerjs/chart';

import { Button, Select } from '@univerjs/design';
import type { LocaleService, Nullable } from '@univerjs/core';
import { DeleteSingle } from '@univerjs/icons';
import { ColorPickerControl } from '../color-picker-control';
import type { IChartOptionType } from '../../services/sheets-chart-ui.service';
import { LinePointOptions } from './widgets';

export interface IDataPointsEditProps {
    chartType: Nullable<ChartTypeBits>;
    data: DeepPartial<ISeriesStyle['dataPoints']>;
    options: IChartOptionType[];
    localeService: LocaleService;
    onChange?: (style: DeepPartial<ISeriesStyle['dataPoints']>) => void;
}

const fallbackPointStyle = {
    shape: defaultChartStyle.point.shape,
    size: defaultChartStyle.point.size,
    color: 'transparent',
};

const linePointControls = ['shape' as const, 'size' as const];

export const DataPointsEdit = (props: IDataPointsEditProps) => {
    const { chartType, data, options, localeService, onChange } = props;
    const { t } = localeService;
    const isLine = chartType === ChartTypeBits.Line;

    const dataPointList = Object.keys(data).map((key) => {
        const dataPoint = data[Number(key)];

        return {
            key,
            style: dataPoint,
        };
    });

    return (
        <div>
            {dataPointList.map((dataPoint) => {
                const { style } = dataPoint;
                if (style === undefined) {
                    return null;
                }
                return (
                    <div key={dataPoint.key}>
                        <div className="chart-edit-panel-row">
                            <div className="chart-edit-panel-row-half">
                                <div className="chart-edit-panel-label">{t('chart.dataPoint')}</div>
                                <Select
                                    value={dataPoint.key}
                                    onChange={(dataPointIndex: string) => {
                                        onChange?.({
                                            [dataPoint.key]: undefined,
                                            [Number(dataPointIndex)]: dataPoint.style,
                                        });
                                    }}
                                    options={options}
                                >
                                </Select>
                            </div>
                            <div className="chart-edit-panel-row-half">
                                <div className="chart-edit-panel-labe">{t('chart.color')}</div>
                                <ColorPickerControl
                                    color={style?.color ?? ''}
                                    onChange={(color) => {
                                        onChange?.({
                                            [dataPoint.key]: {
                                                color,
                                            },
                                        });
                                    }}
                                />
                            </div>
                            <Button
                                type="text"
                                size="small"
                                onClick={() => onChange?.({
                                    [dataPoint.key]: undefined,
                                })}
                            >
                                <DeleteSingle />
                            </Button>
                        </div>
                        <div className="chart-edit-panel-row">
                            {isLine && (
                                <LinePointOptions
                                    pointStyle={{ ...fallbackPointStyle, ...dataPoint.style }}
                                    controls={linePointControls}
                                    localeService={localeService}
                                    onChange={(k, v) => onChange?.({
                                        [dataPoint.key]: {
                                            [k]: v,
                                        },
                                    })}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
