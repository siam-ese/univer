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

import type { DeepPartial, ISeriesLabelStyle, ISeriesStyle } from '@univerjs/chart';
import { ChartAttributeBits, chartBitsUtils, ChartTypeBits, defaultChartStyle, LabelContentType } from '@univerjs/chart';
import { Button, Select } from '@univerjs/design';

import type { LocaleService, Nullable } from '@univerjs/core';
import { IncreaseSingle } from '@univerjs/icons';
import { useChartConfigState } from '../../hooks';
import type { SheetsChartUIService } from '../../services/sheets-chart-ui.service';
import { DataLabelOptions } from '../DataLabelOptions';
import {
    dataLabelPositionOptions,
    getAllSeriesOption,
    labelContentOptions,
    // lineLabelContentOptions,
} from '../options';
import { useTranslatedOptions } from '../use-translated-options';
import { CombinationChartTypeSelect } from './CombinationChartTypeSelect';
import { useSeriesChartType } from './use-series-chart-type';
import { AxisControl, BorderOptions, FillOptions, LinePointOptions } from './widgets';
import { DataPointsEdit } from './DataPointsEdit';
import styles from './index.module.less';

export interface ISeriesStyleEditProps {
    chartType: Nullable<ChartTypeBits>;
    service: SheetsChartUIService;
    localeService: LocaleService;
}

const fallbackLabelStyle: Partial<ISeriesLabelStyle> = {
    fontSize: defaultChartStyle.textStyle.fontSize,
    contentType: defaultChartStyle.labelContentType,
    position: defaultChartStyle.textStyle.position,
};

const allSeriesOptions = [getAllSeriesOption()];

const defaultBorderStyle = defaultChartStyle.borderStyle;

export const SeriesStyleEdit = (props: ISeriesStyleEditProps) => {
    const { chartType, service, localeService } = props;
    const innerDataLabelPositionOptions = useTranslatedOptions(localeService, dataLabelPositionOptions);
    const innerLineLabelContentOptions = useMemo(() => {
        const isStacked = chartType && chartBitsUtils.has(chartType, ChartAttributeBits.Stack);
        const filteredOptions = labelContentOptions.filter((option) => {
            if (isStacked) {
                return true;
            }

            return (option.value as unknown as LabelContentType) !== LabelContentType.Percentage;
        });

        return filteredOptions.map((option) => {
            return {
                value: option.value,
                label: localeService.t(option.label),
            };
        });
    }, [chartType, localeService]);
    const [innerAllSeriesOption] = useTranslatedOptions(localeService, allSeriesOptions);

    const [currentSeriesId, setCurrentSeriesId] = useState<string>(defaultChartStyle.allSeriesId);
    const isAllSeriesStyle = currentSeriesId === defaultChartStyle.allSeriesId;

    const [allSeriesStyle, setAllSeriesStyle] = useChartConfigState('allSeriesStyle', service);
    const [seriesStyleMap, setSeriesStyleMap] = useChartConfigState('seriesStyleMap', service);

    const currentSeriesStyle = seriesStyleMap?.[currentSeriesId];

    const [seriesList] = useChartConfigState('seriesList', service);

    const dataPoints = currentSeriesStyle?.dataPoints;
    // const dataPointsSize = dataPoints ? Object.keys(dataPoints).length : 0;

    const seriesOptions = useMemo(() => seriesList ? [innerAllSeriesOption, ...seriesList] : [], [innerAllSeriesOption, seriesList]);

    const setCurrentSeriesStyle = useCallback((style: DeepPartial<ISeriesStyle>) => {
        setSeriesStyleMap({
            [currentSeriesId]: style,
        });
    }, [currentSeriesId]);

    const setSeriesStyle = isAllSeriesStyle ? setAllSeriesStyle : setCurrentSeriesStyle;

    const isHorizontalChart = chartType ? chartBitsUtils.has(chartType, ChartAttributeBits.Horizontal) : false;
    const seriesChartType = useSeriesChartType(chartType, currentSeriesId, service);

    const isLineChartSeries = seriesChartType === ChartTypeBits.Line;
    const isAreaChartSeries = seriesChartType === ChartTypeBits.Area;
    const isLineOrAreaChart = isLineChartSeries || isAreaChartSeries;

    const borderStyle: ISeriesStyle['border'] = Object.assign({
        color: 'transparent',
        opacity: defaultBorderStyle.opacity,
        width: isLineOrAreaChart ? defaultChartStyle.line.width : defaultBorderStyle.width,
        dashType: defaultBorderStyle.dashType,
    }, allSeriesStyle?.border, currentSeriesStyle?.border);

    const pointStyle: ISeriesStyle['point'] = Object.assign({
        shape: defaultChartStyle.point.shape,
        size: defaultChartStyle.point.size,
        color: 'transparent',
    }, allSeriesStyle?.point, currentSeriesStyle?.point);

    const labelStyle: Partial<ISeriesStyle['label']> = isAllSeriesStyle
        ? (allSeriesStyle?.label ?? {})
        : Object.assign({}, allSeriesStyle?.label, currentSeriesStyle?.label);

    const rightYAxis = currentSeriesStyle?.rightYAxis ?? allSeriesStyle?.rightYAxis;
    // console.log(currentSeriesStyle?.rightYAxis, currentSeriesStyle, 'currentSeriesStyle?.rightYAxis');
    const onlyAxisControl = seriesChartType === ChartTypeBits.None || (chartType === ChartTypeBits.Combination && seriesChartType === ChartTypeBits.Column && isAllSeriesStyle);
    const { t } = localeService;
    return (
        <section>
            <Select className="chart-edit-panel-select" value={currentSeriesId} onChange={(id) => setCurrentSeriesId(id)} options={seriesOptions}></Select>
            {chartType === ChartTypeBits.Combination && (
                <div className="chart-edit-panel-row chart-edit-panel-top-gap">
                    <div className="chart-edit-panel-label">{t('chart.chartType')}</div>
                    <CombinationChartTypeSelect seriesId={currentSeriesId} service={service} localeService={localeService} />
                </div>
            )}

            <div className="chart-edit-panel-row chart-edit-panel-row-wrap">
                {!onlyAxisControl && (
                    <>
                        {!isLineChartSeries && <FillOptions seriesStyle={isAllSeriesStyle ? allSeriesStyle : currentSeriesStyle} onSeriesStyleChange={setSeriesStyle} localeService={localeService} />}
                        <BorderOptions controlName={t(isLineOrAreaChart ? 'chart.line' : 'chart.border')} borderStyle={borderStyle} onSeriesStyleChange={setSeriesStyle} localeService={localeService} />
                        {isLineOrAreaChart && <LinePointOptions pointStyle={pointStyle} onSeriesStyleChange={setSeriesStyle} localeService={localeService} />}
                    </>
                )}
                {!isHorizontalChart && (
                    <AxisControl rightYAxis={Boolean(rightYAxis)} onSeriesStyleChange={setSeriesStyle} localeService={localeService} />
                )}
            </div>
            <div className="chart-edit-panel-top-gap">
                <div className="chart-edit-panel-row">
                    <div className="chart-edit-panel-row-half">{t('chart.withFormat', t('chart.dataPoint'))}</div>
                    <div className="chart-edit-panel-row-half chart-edit-panel-text-right">
                        <Button className={styles.seriesStyleEditAddDataPointBtn} type="text" size="small">
                            <IncreaseSingle />
                            <span>{t('chart.addDataPoint')}</span>
                        </Button>
                    </div>
                </div>
                {dataPoints && <DataPointsEdit dataPoints={dataPoints} />}
            </div>
            <div className="chart-edit-panel-top-gap">
                <DataLabelOptions
                    localeService={localeService}
                    fallbackLabelStyle={fallbackLabelStyle}
                    labelStyle={labelStyle}
                    positionOptions={innerDataLabelPositionOptions}
                    contentTypeOptions={innerLineLabelContentOptions}
                    onLabelStyleChange={(name, value) => setSeriesStyle({ label: { [name]: value } })}
                    onVisibleChange={(visible) => setSeriesStyle({ label: { visible } })}
                />
            </div>
        </section>
    );
};
