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

import type { ILabelStyle, IRuntimeAxis, LegendPosition } from '@univerjs/chart';
import { AxisValueType, chartBitsUtils, ChartTypeBits, defaultChartStyle, IRuntimeAxisPosition } from '@univerjs/chart';
import { Input, Select } from '@univerjs/design';
import type { CollapseProps } from 'rc-collapse';
import Collapse from 'rc-collapse';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LocaleService, useDependency } from '@univerjs/core';
import { ColorPickerControl } from '../../../components/color-picker-control';
import { FontFormatBar } from '../../../components/font-format-bar';
import { PieChartStyleEdit } from '../../../components/PieChartStyleEdit';
import { GridLineAndTickOptions } from '../../../components/grid-line-and-tick-options/GridLineAndTickOptions';
import type { OptionType, TitleOptionValue } from '../../../components/options';
import { useChartConfigState, useSheetsChartUIService } from '../../../hooks';
import { legendLabelPositionOptions, titleOptions } from '../../../components/options';
import { SeriesStyleEdit } from '../../../components/series-style-edit/SeriesStyleEdit';
import { AxisOptionsEdit } from '../../../components/AxisOptionsEdit';
import { useTranslatedOptions } from '../../../components/use-translated-options';
import styles from './index.module.less';

const { textStyle } = defaultChartStyle;

/** If has right y axis we need to rename vertical axis to left axis */
export const StyleTabPanel = () => {
    const localeService = useDependency(LocaleService);
    const sheetsChartUIService = useSheetsChartUIService();
    const { t } = localeService;
    const [chartType, setChartType] = useChartConfigState('chartType', sheetsChartUIService);
    const [headers] = useChartConfigState('headers', sheetsChartUIService);
    const [backgroundColor, setBackgroundColor] = useChartConfigState('backgroundColor', sheetsChartUIService, '');
    const [borderColor, setBorderColor] = useChartConfigState('borderColor', sheetsChartUIService, '');

    const [legendStyle, setLegendStyle] = useChartConfigState('legendStyle', sheetsChartUIService);
    const [xAxisOptions, setXAxisOptions] = useChartConfigState('xAxisOptions', sheetsChartUIService);
    const [yAxisOptions, setYAxisOptions] = useChartConfigState('yAxisOptions', sheetsChartUIService);
    const [rightYAxisOptions, setRightYAxisOptions] = useChartConfigState('rightYAxisOptions', sheetsChartUIService);
    const [titles, setTitles] = useChartConfigState('titles', sheetsChartUIService);

    const [runtimeAxes] = useChartConfigState('runtimeAxes', sheetsChartUIService);

    const [content, setContent] = useState('');
    // const [currentAxisId, setCurrentAxisId] = useState<string>(axisListOptions[0].value);

    const axisMap = useMemo(() => {
        return runtimeAxes?.reduce((acc, axis) => {
            acc[axis.position] = axis;
            return acc;
        }, {} as Partial<Record<IRuntimeAxisPosition, IRuntimeAxis>>);
    }, [runtimeAxes]);

    const dualVerticalAxes = Boolean(axisMap?.[IRuntimeAxisPosition.Right]) && Boolean(axisMap?.[IRuntimeAxisPosition.Left]);

    const [titleType, setTitleType] = useState<TitleOptionValue>(titleOptions[0].value);

    const _currentTitleStyle = titles?.[titleType];
    const currentTitleStyle = {
        color: textStyle.color,
        fontSize: titleType === 'title'
            ? textStyle.titleFontSize
            : titleType === 'subtitle'
                ? textStyle.subTitleFontSize
                : textStyle.fontSize,
        ..._currentTitleStyle,
    };

    const setCurrentTitleStyle = useCallback((titleStyle: Partial<ILabelStyle>) => {
        setTitles({
            [titleType]: titleStyle,
        });
    }, [titleType]);

    // const gridLineStyle = currentAxisId === 'xAxis' ? xAxisOptions?.gridLine : yAxisOptions?.gridLine;
    // const setGridLineStyle = useCallback((gridLineStyle: Partial<IGridLineStyle>) => {
    //     if (currentAxisId === 'xAxis') {
    //         setXAxisOptions({ gridLine: gridLineStyle });
    //     } else {
    //         setYAxisOptions({ gridLine: gridLineStyle });
    //     }
    // }, [currentAxisId]);

    useEffect(() => {
        setContent(currentTitleStyle?.content ?? '');
    }, [currentTitleStyle?.content]);

    // const innerAxisListOptions = useTranslatedOptions(localeService, axisListOptions);
    const innerLegendLabelPositionOptions = useTranslatedOptions(localeService, legendLabelPositionOptions);
    const innerTitleOptions = useTranslatedOptions(localeService, titleOptions as unknown as OptionType[]);
    // useMemo(() => {
    //     return titleOptions
    //         .filter((option) => {
    //             if (dualVerticalAxes) {
    //                 return true;
    //             }
    //             // If no right y axis, hide right y axis title option
    //             return option.value !== 'rightYAxisTitle';
    //         }).map((option) => {
    //             return {
    //                 ...option,
    //                 label: (option.value === 'yAxisTitle' && dualVerticalAxes) ? t('chart.titles.leftAxisTitle') : t(option.label),
    //             };
    //         });
    // }, [dualVerticalAxes, localeService]);

    const isPie = Boolean(chartType && chartBitsUtils.baseOn(chartType, ChartTypeBits.Pie));
    const collapseItems = [
        {
            label: t('chart.chartStyle'),
            children: (
                <section>
                    <div className={styles.styleTabPanelRow}>
                        <div className={styles.styleTabPanelRowHalf}>
                            <div className={styles.styleTabPanelLabel}>{t('chart.backgroundColor')}</div>
                            <ColorPickerControl color={backgroundColor} onChange={setBackgroundColor} />
                        </div>
                        <div className={styles.styleTabPanelRowHalf}>
                            <div className={styles.styleTabPanelLabel}>{t('chart.chartBorderColor')}</div>
                            <ColorPickerControl color={borderColor} onChange={setBorderColor} />
                        </div>
                    </div>
                </section>
            ),
        },
        {
            label: t('chart.chartAndAxisTitles'),
            children: (
                <section>
                    <Select className="chart-edit-panel-select" value={titleType} options={innerTitleOptions} onChange={(value) => setTitleType(value as TitleOptionValue)}></Select>
                    <div>
                        <div className="chart-edit-panel-label">{t('chart.titles.titleText')}</div>
                        <Input
                            value={content || (titleType === 'title' ? (headers || []).join(',') : '')}
                            onChange={setContent}
                            onBlur={() => {
                                if (content !== currentTitleStyle?.content) {
                                    setCurrentTitleStyle({ content });
                                }
                            }}
                        />
                    </div>
                    <div>
                        <div className="chart-edit-panel-label">{t('chart.titles.titleFormat')}</div>
                        <div className={styles.styleTabPanelFontStyleBar}>
                            <FontFormatBar alignControl localeService={localeService} {...currentTitleStyle} onChange={(key, value) => setCurrentTitleStyle({ [key]: value })} />
                        </div>
                    </div>
                </section>
            ),
        },
        !isPie && {
            label: t('chart.series'),
            children: (
                <SeriesStyleEdit chartType={chartType} service={sheetsChartUIService} localeService={localeService} />
            ),
        },
        isPie && {
            label: t('chartTypes.pie'),
            children: <PieChartStyleEdit chartType={chartType} service={sheetsChartUIService} localeService={localeService} onChartTypeChange={setChartType} />,
        },
        {
            label: t('chart.legend'),
            children: (
                <section>
                    <div>
                        <div>
                            <h5>{t('chart.position')}</h5>
                            <Select value={legendStyle?.position ?? defaultChartStyle.legend.position} onChange={(position) => setLegendStyle({ position: position as LegendPosition })} options={innerLegendLabelPositionOptions} />
                        </div>
                        <div>
                            <h5>{t('chart.titles.titleFormat')}</h5>
                            <FontFormatBar
                                {...legendStyle?.label}
                                localeService={localeService}
                                fontSize={legendStyle?.label?.fontSize ?? defaultChartStyle.textStyle.fontSize}
                                color={legendStyle?.label?.color ?? defaultChartStyle.textStyle.color}
                                onChange={(name, value) => setLegendStyle({ label: { [name]: value } })}
                            />
                        </div>
                    </div>
                </section>
            ),
        },
        {
            label: t('chart.axes.horizontalAxis'),
            children: (
                <AxisOptionsEdit
                    localeService={localeService}
                    axisOptions={xAxisOptions}
                    valueAxis={axisMap?.[IRuntimeAxisPosition.Bottom]?.type === AxisValueType.Numeric}
                    onChange={setXAxisOptions}
                />
            ),
        },
        {
            label: t('chart.axes.verticalAxis'),
            children: (
                <AxisOptionsEdit
                    localeService={localeService}
                    axisOptions={yAxisOptions}
                    valueAxis={axisMap?.[IRuntimeAxisPosition.Left]?.type === AxisValueType.Numeric}
                    onChange={setYAxisOptions}
                />
            ),
        },
        dualVerticalAxes && {
            label: t('chart.axes.rightVerticalAxis'),
            children: (
                <AxisOptionsEdit
                    localeService={localeService}
                    axisOptions={rightYAxisOptions}
                    onChange={setRightYAxisOptions}
                    valueAxis
                />
            ),
        },
        {
            label: t('chart.gridlinesAndTicks'),
            children: (
                <section>

                    <GridLineAndTickOptions
                        service={sheetsChartUIService}
                        localeService={localeService}
                        className="chart-edit-panel-top-gap"
                        runtimeAxes={runtimeAxes}
                        // onChange={(name, value) => setGridLineStyle({ [name === 'gridLine' ? 'visible' : name]: value })}

                    />
                </section>
            ),
        },
    ].filter(Boolean) as CollapseProps['items'];

    return (
        <div className={styles.styleTabPanel}>
            <Collapse
                className={styles.styleTabPanelCollapse}
                accordion
                items={collapseItems}
            >
            </Collapse>
        </div>
    );
};
