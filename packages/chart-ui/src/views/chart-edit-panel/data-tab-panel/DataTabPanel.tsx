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

import type { InvalidValueType, StackType } from '@univerjs/chart';
import { chartBitsUtils, ChartTypeBits, DataDirection, defaultChartStyle, SHEETS_CHART_PLUGIN_NAME } from '@univerjs/chart';
import type { IUnitRange, Workbook } from '@univerjs/core';
import { createInternalEditorID, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { Button, Checkbox, Dropdown, Menu, MenuItem, Select } from '@univerjs/design';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle } from '@univerjs/icons';
import { RangeSelector } from '@univerjs/ui';
import clsx from 'clsx';
import React from 'react';
import { useChartConfigState, useSheetsChartUIService } from '../../../hooks';
import { areaLineTypeOptions, chartTypeOptions, invalidValueOptions, stackTypeOptions } from '../../../components/options';
import { ButtonSwitch } from '../../../components/button-switch';
import { RadarChartOptionsEdit } from '../../../components/RadarChartOptionsEdit';
import styles from './index.module.less';

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

const ableStackCharts = [ChartTypeBits.Area, ChartTypeBits.Column];

export const DataTabPanel = () => {
    const sheetsChartUIService = useSheetsChartUIService();
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);

    const [chartType, setChartType] = useChartConfigState('chartType', sheetsChartUIService);

    const [stackType, setStackType] = useChartConfigState('stackType', sheetsChartUIService);

    const [dataRange, setDataRange] = useChartConfigState('dataRange', sheetsChartUIService);
    const onRangeSelectorChange = (ranges: IUnitRange[]) => {
        setDataRange(ranges[0].range);
    };

    const [areaLineStyle, setAreaLineStyle] = useChartConfigState('areaLineStyle', sheetsChartUIService);
    const [categoryIndex, setCategoryIndex] = useChartConfigState('categoryIndex', sheetsChartUIService);
    const [categoryOptions] = useChartConfigState('categoryList', sheetsChartUIService);
    const [seriesValues, setSeriesValues] = useChartConfigState('seriesValues', sheetsChartUIService);
    const [seriesOptions] = useChartConfigState('seriesResourceList', sheetsChartUIService);

    const [aggregate, setAggregate] = useChartConfigState('aggregate', sheetsChartUIService);
    const [gradientFill, setGradientFill] = useChartConfigState('gradientFill', sheetsChartUIService);

    const [defaultDirection] = useChartConfigState('defaultDirection', sheetsChartUIService);
    const [direction, setDirection] = useChartConfigState('direction', sheetsChartUIService);
    const [invalidValueType, setInvalidValueType] = useChartConfigState('invalidValueType', sheetsChartUIService);

    const removeSeries = (index: number) => {
        if (seriesValues) {
            setSeriesValues(seriesValues.filter((_, i) => i !== index));
        }
    };

    const [seriesStyleMap] = useChartConfigState('seriesStyleMap', sheetsChartUIService);
    const [asCategory, setAsCategory] = useChartConfigState('asCategory', sheetsChartUIService);

    // Show stack control under chart type between able stack charts and combination chart with able stack inner chart
    const showStackControl = chartType && (
        ableStackCharts.some((type) => chartBitsUtils.baseOn(chartType, type))
        || (chartType === ChartTypeBits.Combination && seriesValues?.some((value) => {
            const innerChartType = seriesStyleMap?.get(String(value))?.chartType;
            return innerChartType ? ableStackCharts.some((type) => chartBitsUtils.baseOn(innerChartType, type)) : true;
        }))
    );

    const showMoreSettings = chartType && [ChartTypeBits.Area, ChartTypeBits.Line].some((type) => chartBitsUtils.baseOn(chartType, type));
    const showGradientFill = chartType && [ChartTypeBits.Line, ChartTypeBits.Radar].every((type) => type !== chartType);

    return (
        <div>
            <div>
                <h5>Chart Type</h5>
                <Select className="chart-edit-panel-select" value={chartType ? String(chartType) : ''} options={chartTypeOptions} onChange={(v) => setChartType(Number(v) as ChartTypeBits)}></Select>
            </div>
            {chartType && chartBitsUtils.baseOn(chartType, ChartTypeBits.Area) && <ButtonSwitch options={areaLineTypeOptions} className="chart-edit-panel-top-gap" value={areaLineStyle ?? defaultChartStyle.area.lineStyle} onChange={setAreaLineStyle as ((value: string) => void)} />}
            {chartType === ChartTypeBits.Radar && (
                <RadarChartOptionsEdit service={sheetsChartUIService} className="chart-edit-panel-top-gap" />
            )}
            <div>
                <h5>Themes</h5>
                {showGradientFill && (
                    <Checkbox checked={gradientFill} onChange={(v) => setGradientFill(Boolean(v))}>Gradient fill</Checkbox>
                )}
            </div>
            <div>
                <h5>Stack</h5>
                {showStackControl && (
                    <Select className="chart-edit-panel-select" value={stackType || ''} options={stackTypeOptions} onChange={(v) => setStackType(v as StackType)}></Select>
                )}
            </div>
            <div>
                <h5>Data Range</h5>
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
                <h5>
                    Category

                </h5>
                <Select className="chart-edit-panel-select " value={typeof categoryIndex === 'number' ? String(categoryIndex) : ''} options={categoryOptions || []} onChange={(v) => setCategoryIndex(Number(v))}></Select>
                <div className="chart-edit-panel-top-gap">
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
                <h5>
                    Series
                </h5>
                <div className="chart-edit-panel-top-gap">
                    {seriesValues?.map((value, index) => {
                        return (
                            <div key={index} className={clsx(styles.dataTabPanelSeriesSelect, '')}>
                                <Select
                                    className="chart-edit-panel-select"
                                    value={String(value)}
                                    options={seriesOptions}
                                    onChange={(v) => {
                                        seriesValues[index] = Number(v);
                                        setSeriesValues(seriesValues.slice());
                                    }}
                                >
                                </Select>
                                <Button className={styles.dataTabPanelSeriesSelectDelete} size="small" type="text" onClick={() => removeSeries(index)}>
                                    <DeleteSingle />
                                </Button>
                            </div>
                        );
                    })}
                    <Dropdown overlay={(
                        <Menu>
                            {seriesOptions?.map((option, index) => (
                                <MenuItem
                                    key={index}
                                    onClick={() => {
                                        setSeriesValues([...(seriesValues || []), Number(option.value)]);
                                    }}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Menu>
                    )}
                    >
                        <Button className={clsx('', styles.dataTabPanelAddSeriesBtn)} size="small" type="primary">Add Series</Button>
                    </Dropdown>
                </div>

                <div className="chart-edit-panel-top-gap">
                    <Checkbox
                        checked={direction !== defaultDirection}
                        onChange={() => {
                            setDirection(direction === DataDirection.Row ? DataDirection.Column : DataDirection.Row);
                        }}
                    >
                        Switch to Row/Column
                    </Checkbox>
                </div>

                <div className="chart-edit-panel-top-gap">
                    <Checkbox
                        checked={String(categoryIndex) === asCategory?.value}
                        onChange={(v) => {
                            // console.log(v, 'onchange');
                            setAsCategory(v ? asCategory : undefined);
                        }}
                    >
                        Use
                        {' '}
                        {direction || ''}
                        {asCategory?.label}
                        {' '}
                        as labels
                    </Checkbox>
                </div>
            </div>
            {showMoreSettings && (
                <div>
                    <h5>More settings</h5>
                    <Select className="chart-edit-panel-select " value={invalidValueType ?? defaultChartStyle.invalidValueType} options={invalidValueOptions} onChange={(v) => setInvalidValueType(v as InvalidValueType)}></Select>
                </div>
            )}
        </div>
    );
};
