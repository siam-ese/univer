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
import { CategoryType, chartBitsUtils, ChartTypeBits, DataOrientation, defaultChartStyle, SHEETS_CHART_PLUGIN_NAME } from '@univerjs/chart';
import type { IUnitRange, Workbook } from '@univerjs/core';
import { createInternalEditorID, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { Button, Checkbox, Dropdown, Menu, MenuItem, Select } from '@univerjs/design';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle } from '@univerjs/icons';
import { RangeSelector } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useChartConfigState, useSheetsChartUIService } from '../../../hooks';
import { areaLineTypeOptions, chartTypeOptions, invalidValueOptions, stackTypeOptions } from '../../../components/options';
import { useTranslatedOptions } from '../../../components/use-translated-options';
import { ButtonSwitch } from '../../../components/button-switch';
import { RadarChartOptionsEdit } from '../../../components/RadarChartOptionsEdit';
import styles from './index.module.less';

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

const ableStackCharts = [ChartTypeBits.Area, ChartTypeBits.Column];

export const DataTabPanel = () => {
    const sheetsChartUIService = useSheetsChartUIService();
    const univerInstanceService = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);

    const innerChartTypeOptions = useTranslatedOptions(localeService, chartTypeOptions);
    const innerInvalidValueOptions = useTranslatedOptions(localeService, invalidValueOptions);
    const innerStackTypeOptions = useTranslatedOptions(localeService, stackTypeOptions);
    const innerAreaLineTypeOptions = useTranslatedOptions(localeService, areaLineTypeOptions);

    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);

    const [chartType, setChartType] = useChartConfigState('chartType', sheetsChartUIService);

    const [stackType, setStackType] = useChartConfigState('stackType', sheetsChartUIService);

    const [dataRange, setDataRange] = useChartConfigState('dataRange', sheetsChartUIService);

    const [areaLineStyle, setAreaLineStyle] = useChartConfigState('areaLineStyle', sheetsChartUIService);
    const [categoryIndex, setCategoryIndex] = useChartConfigState('categoryIndex', sheetsChartUIService);
    const [categoryType] = useChartConfigState('categoryType', sheetsChartUIService);
    const [categoryOptions] = useChartConfigState('categoryList', sheetsChartUIService);
    const [seriesValues, setSeriesValues] = useChartConfigState('seriesValues', sheetsChartUIService);
    const [seriesOptions] = useChartConfigState('seriesResourceList', sheetsChartUIService);

    const [aggregate, setAggregate] = useChartConfigState('aggregate', sheetsChartUIService);
    const [_gradientFill, setGradientFill] = useChartConfigState('gradientFill', sheetsChartUIService);
    const gradientFill = useMemo(() => {
        if (_gradientFill === undefined) {
            return chartType ? chartBitsUtils.baseOn(chartType, ChartTypeBits.Area) : false;
        }
        return _gradientFill;
    }, [_gradientFill, chartType]);

    // const [defaultDirection] = useChartConfigState('defaultDirection', sheetsChartUIService);
    const [orient, setOrient] = useChartConfigState('orient', sheetsChartUIService);
    const [invalidValueType, setInvalidValueType] = useChartConfigState('invalidValueType', sheetsChartUIService);

    const [seriesStyleMap] = useChartConfigState('seriesStyleMap', sheetsChartUIService);
    const [asCategory, setAsCategory] = useChartConfigState('asCategory', sheetsChartUIService);

    // Show stack control under chart type between able stack charts and combination chart with able stack inner chart
    const showStackControl = chartType && (
        ableStackCharts.some((type) => chartBitsUtils.baseOn(chartType, type))
        || (chartType === ChartTypeBits.Combination && seriesValues?.some((value) => {
            const innerChartType = seriesStyleMap?.[value]?.chartType;
            return innerChartType ? ableStackCharts.some((type) => chartBitsUtils.baseOn(innerChartType, type)) : true;
        }))
    );
    const showMoreSettings = chartType && [ChartTypeBits.Area, ChartTypeBits.Line].some((type) => chartBitsUtils.baseOn(chartType, type));
    const showGradientFill = chartType && [ChartTypeBits.Line, ChartTypeBits.Pie, ChartTypeBits.Radar].every((type) => type !== chartType);
    const showAsCategoryControl = (categoryType === CategoryType.Linear) || (typeof categoryIndex !== 'number');

    const onRangeSelectorChange = (ranges: IUnitRange[]) => {
        setDataRange(ranges[0].range);
    };

    const removeSeries = (index: number) => {
        if (seriesValues) {
            setSeriesValues(seriesValues.filter((_, i) => i !== index));
        }
    };
    const { t } = localeService;
    return (
        <div>
            <div>
                <h5>{t('chart.chartType')}</h5>
                <Select className="chart-edit-panel-select" value={chartType ? String(chartType) : ''} options={innerChartTypeOptions} onChange={(v) => setChartType(Number(v) as ChartTypeBits)}></Select>
            </div>
            {chartType && chartBitsUtils.baseOn(chartType, ChartTypeBits.Area) && <ButtonSwitch options={innerAreaLineTypeOptions} className="chart-edit-panel-top-gap" value={areaLineStyle ?? defaultChartStyle.area.lineStyle} onChange={setAreaLineStyle as ((value: string) => void)} />}
            {chartType === ChartTypeBits.Radar && (
                <RadarChartOptionsEdit localeService={localeService} service={sheetsChartUIService} className="chart-edit-panel-top-gap" />
            )}

            {showGradientFill && (
                <div>
                    <h5>{t('chart.themes')}</h5>
                    <Checkbox checked={!!gradientFill} onChange={(v) => setGradientFill(Boolean(v))}>{t('chart.gradientFill')}</Checkbox>
                </div>
            )}

            {showStackControl && (
                <div>
                    <h5>Stack</h5>
                    <Select className="chart-edit-panel-select" value={stackType || ''} options={innerStackTypeOptions} onChange={(v) => setStackType(v as StackType)}></Select>
                </div>
            )}
            <div>
                <h5>{t('chart.dataRange')}</h5>
                <RangeSelector
                    width={'100%' as unknown as number}
                    openForSheetSubUnitId={subUnitId}
                    openForSheetUnitId={unitId}
                    value={dataRange ? serializeRange(dataRange) : ''}
                    id={createInternalEditorID(`${SHEETS_CHART_PLUGIN_NAME}_rangeSelector`)}
                    onChange={onRangeSelectorChange}
                />
            </div>
            <div>
                <h5>{t('chart.category')}</h5>
                <Select className="chart-edit-panel-select " value={typeof categoryIndex === 'number' ? String(categoryIndex) : ''} options={categoryOptions || []} onChange={(v) => setCategoryIndex(Number(v))}></Select>
                <div className="chart-edit-panel-top-gap">
                    <Checkbox
                        checked={aggregate}
                        onChange={(v) => {
                            setAggregate(Boolean(v));
                        }}
                    >
                        {t('chart.aggregate')}
                    </Checkbox>
                </div>
            </div>
            <div>
                <h5>{t('chart.series')}</h5>
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
                        <Button className={clsx('chart-edit-panel-top-gap', styles.dataTabPanelAddSeriesBtn)} size="small" type="primary">{t('chart.addSeries')}</Button>
                    </Dropdown>
                </div>

                <div className="chart-edit-panel-top-gap">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                            setOrient(orient === DataOrientation.Row ? DataOrientation.Column : DataOrientation.Row);
                        }}
                    >
                        {t('chart.settingsLabels.switchToRowOrColumn')}
                    </Button>
                </div>

                {showAsCategoryControl && (
                    <div className="chart-edit-panel-top-gap">
                        <Checkbox
                            checked={asCategory}
                            onChange={(v) => {
                                setAsCategory(!!v);
                            }}
                        >
                            {t('chart.settingsLabels.useAsCategoryLabels', `${orient || ''} ${((orient === DataOrientation.Row ? dataRange?.startRow : dataRange?.startColumn) ?? 0) + 1}`)}
                        </Checkbox>
                    </div>
                )}

            </div>
            {showMoreSettings && (
                <div>
                    <h5>{t('chart.moreSettings')}</h5>
                    <div className="chart-edit-panel-top-gap">
                        <div className="chart-edit-panel-label">{t('chart.settingsLabels.showEmptyCellsAs')}</div>
                        <Select className="chart-edit-panel-select " value={invalidValueType ?? defaultChartStyle.invalidValueType} options={innerInvalidValueOptions} onChange={(v) => setInvalidValueType(v as InvalidValueType)}></Select>
                    </div>
                </div>
            )}
        </div>
    );
};
