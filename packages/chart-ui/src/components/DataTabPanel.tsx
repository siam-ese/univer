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

import { ChartType, DataDirection, SHEETS_CHART_PLUGIN_NAME, StackType } from '@univerjs/chart';
import type { ISelectProps } from '@univerjs/design';
import { Button, Checkbox, Select } from '@univerjs/design';
import React from 'react';
import { RangeSelector } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IUnitRange, Workbook } from '@univerjs/core';
import { createInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { serializeRange } from '@univerjs/engine-formula';
import { useChartConfigState, useSheetsChartUIService } from '../hooks';

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
export const DataTabPanel = () => {
    const sheetsChartUIService = useSheetsChartUIService();
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);

    const [chartType, setChartType] = useChartConfigState('chartType', sheetsChartUIService, ChartType.Line);
    const chartTypeOptions: ISelectProps['options'] = [
        {
            label: 'Line',
            value: ChartType.Line,
        },
        {
            label: 'Bar',
            value: ChartType.Bar,
        },
        {
            label: 'BarStacked',
            value: ChartType.BarStacked,
        },
        {
            label: 'Pie',
            value: ChartType.Pie,
        },
    ];

    const [stackType, setStackType] = useChartConfigState('stackType', sheetsChartUIService);

    const stackTypeOptions: ISelectProps['options'] = [
        {
            label: 'None',
            value: '',
        },
        {
            label: 'Normal',
            value: StackType.Normal,
        },
        {
            label: 'Percent',
            value: StackType.Percent,
        },
    ];

    const [dataRange, setDataRange] = useChartConfigState('dataRange', sheetsChartUIService);
    const onRangeSelectorChange = (ranges: IUnitRange[]) => {
        // console.log('onRangeSelectorChange', ranges[0].range);
        setDataRange(ranges[0].range);
    };

    const [categoryIndex, setCategoryIndex] = useChartConfigState('categoryIndex', sheetsChartUIService);
    const [categoryOptions] = useChartConfigState('categoryList', sheetsChartUIService);
    const [seriesValues, setSeriesValues] = useChartConfigState('seriesValues', sheetsChartUIService);
    const [seriesOptions] = useChartConfigState('seriesList', sheetsChartUIService);
    const [aggregate, setAggregate] = useChartConfigState('aggregate', sheetsChartUIService);

    const [defaultDirection] = useChartConfigState('defaultDirection', sheetsChartUIService);
    const [direction, setDirection] = useChartConfigState('direction', sheetsChartUIService);
    // console.log(defaultDirection, 'defaultDirection');
    const removeSeries = (index: number) => {
        if (seriesValues) {
            setSeriesValues(seriesValues.filter((_, i) => i !== index));
        }
    };

    const [asCategory, setAsCategory] = useChartConfigState('asCategory', sheetsChartUIService);

    return (
        <div>
            <span>DataTabPanel</span>
            <div>
                <h4>Chart Type</h4>
                <Select value={chartType} options={chartTypeOptions} onChange={(v) => setChartType(v as ChartType)}></Select>
            </div>
            <div>
                <h4>Stack</h4>
                <Select value={stackType || ''} options={stackTypeOptions} onChange={(v) => setStackType(v as StackType)}></Select>
            </div>
            <div>
                <h4>Data Range</h4>
                <RangeSelector
                    placeholder="Select a range"
                    width={'100%' as unknown as number}
                    openForSheetSubUnitId={subUnitId}
                    openForSheetUnitId={unitId}
                    value={dataRange ? serializeRange(dataRange) : ''}
                    id={createInternalEditorID(`${SHEETS_CHART_PLUGIN_NAME}_rangeSelector`)}
                    onChange={onRangeSelectorChange}
                />
            </div>
            <div>
                <h4>
                    Category

                </h4>
                <Select value={typeof categoryIndex === 'number' ? String(categoryIndex) : ''} options={categoryOptions || []} onChange={(v) => setCategoryIndex(Number(v))}></Select>
                <div>
                    <Checkbox
                        checked={aggregate}
                        onChange={(v) => {
                            setAggregate(Boolean(v));
                        }}
                    >
                        {' '}
                        Aggregate
                    </Checkbox>
                </div>
            </div>
            <div>
                <h4>
                    Series

                </h4>
                {seriesValues?.map((value, index) => {
                    return (
                        <div key={index}>
                            <Select
                                value={String(value)}
                                options={seriesOptions}
                                onChange={(v) => {
                                    seriesValues[index] = Number(v);
                                    setSeriesValues(seriesValues.slice());
                                }}
                            >
                            </Select>
                            <Button onClick={() => removeSeries(index)}>Remove</Button>
                        </div>
                    );
                })}
                <div>
                    <Checkbox
                        checked={defaultDirection !== direction}
                        onChange={() => {
                            setDirection(direction === DataDirection.Row ? DataDirection.Column : DataDirection.Row);
                        }}
                    >
                        {' '}
                        Switch to Row/Column
                    </Checkbox>
                </div>

                <div>
                    <Checkbox
                        checked={String(categoryIndex) === asCategory?.value}
                        onChange={(v) => {
                            // console.log(v, 'onchange');
                            setAsCategory(v ? asCategory : undefined);
                        }}
                    >
                        {' '}
                        Use
                        {' '}
                        {direction || ''}
                        {' '}
                        {asCategory?.label}
                        {' '}
                        as labels
                    </Checkbox>
                </div>
            </div>

        </div>
    );
};
