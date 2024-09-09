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

import type { IGridLineStyle, LegendPosition } from '@univerjs/chart';
import { chartBitsUtils, ChartTypeBits, defaultChartStyle } from '@univerjs/chart';
import { Checkbox, Input, InputNumber, Select } from '@univerjs/design';
import clsx from 'clsx';
import type { CollapseProps } from 'rc-collapse';
import Collapse from 'rc-collapse';
import React, { useCallback, useEffect, useState } from 'react';
import { ColorPickerControl } from '../../../components/color-picker-control';
import { FontFormatBar } from '../../../components/font-format-bar';
import { PieChartStyleEdit } from '../../../components/PieChartStyleEdit';
import { GridLineAndTickOptions } from '../../../components/grid-line-and-tick-options/GridLineAndTickOptions';
import type { TitleOptionValue } from '../../../components/options';
import { useChartConfigState, useSheetsChartUIService } from '../../../hooks';
import { axisListOptions, legendLabelPositionOptions, titleOptions } from '../../../components/options';
import { SeriesStyleEdit } from '../../../components/SeriesStyleEdit';
import styles from './index.module.less';

const { textStyle } = defaultChartStyle;

export const StyleTabPanel = () => {
    const sheetsChartUIService = useSheetsChartUIService();

    const [chartType] = useChartConfigState('chartType', sheetsChartUIService);
    const [backgroundColor, setBackgroundColor] = useChartConfigState('backgroundColor', sheetsChartUIService, '');
    const [borderColor, setBorderColor] = useChartConfigState('borderColor', sheetsChartUIService, '');
    const [fontSize, setFontSize] = useChartConfigState('fontSize', sheetsChartUIService, textStyle.fontSize);
    const [titleFontSize, setTitleFontSize] = useChartConfigState('titleFontSize', sheetsChartUIService, textStyle.titleFontSize);
    // const [seriesList] = useChartConfigState('seriesList', sheetsChartUIService);
    // const [allSeriesStyle, setAllSeriesStyle] = useChartConfigState('allSeriesStyle', sheetsChartUIService);
    // const [seriesStyleMap, setSeriesStyleMap] = useChartConfigState('seriesStyleMap', sheetsChartUIService);
    const [legendStyle, setLegendStyle] = useChartConfigState('legendStyle', sheetsChartUIService);
    const [xAxisOptions, setXAxisOptions] = useChartConfigState('xAxisOptions', sheetsChartUIService);
    const [yAxisOptions, setYAxisOptions] = useChartConfigState('yAxisOptions', sheetsChartUIService);

    const [titleType, setTitleType] = useState<TitleOptionValue>(titleOptions[0].value);
    const [currentTitleStyle, setCurrentTitleStyle] = useChartConfigState(titleType, sheetsChartUIService);
    // const seriesOptions = useMemo(() => seriesList ? [getAllSeriesOption(), ...seriesList] : [], [seriesList]);

    const [content, setContent] = useState('');
    const [currentAxisId, setCurrentAxisId] = useState<string>(axisListOptions[0].value);
    // const [currentSeriesId, setCurrentSeriesId] = useState<string>(defaultChartStyle.allSeriesId);

    const gridLineStyle = currentAxisId === 'xAxis' ? xAxisOptions?.gridLine : yAxisOptions?.gridLine;
    const setGridLineStyle = useCallback((gridLineStyle: Partial<IGridLineStyle>) => {
        if (currentAxisId === 'xAxis') {
            setXAxisOptions({ gridLine: gridLineStyle });
        } else {
            setYAxisOptions({ gridLine: gridLineStyle });
        }
    }, [currentAxisId]);

    // const currentSeriesStyle = seriesStyleMap?.get(currentSeriesId);
    // const setCurrentSeriesStyle = useCallback((style: DeepPartial<ISeriesStyle>) => {
    //     seriesStyleMap?.set(currentSeriesId, style);
    // }, [currentSeriesId, seriesStyleMap]);

    // const setSeriesStyle = currentSeriesId === defaultChartStyle.allSeriesId ? setAllSeriesStyle : setCurrentSeriesStyle;

    useEffect(() => {
        const titleContent = currentTitleStyle?.content;
        if (titleContent) {
            setContent(titleContent);
        }
    }, [currentTitleStyle?.content]);

    // const defaultBorderStyle = defaultChartStyle.borderStyle;
    // const borderStyle: ISeriesStyle['border'] = Object.assign({
    //     color: 'transparent',
    //     opacity: defaultBorderStyle.opacity,
    //     width: defaultBorderStyle.width,
    //     dashType: defaultBorderStyle.dashType,
    // }, allSeriesStyle?.border, currentSeriesStyle?.border);

    // const labelStyle: Partial<ISeriesStyle['label']> = currentSeriesId === defaultChartStyle.allSeriesId
    //     ? (allSeriesStyle?.label ?? {})
    //     : Object.assign({}, allSeriesStyle?.label, currentSeriesStyle?.label);

    const [yAxisMax, setYAxisMax] = useState(yAxisOptions?.max);
    const [yAxisMin, setYAxisMin] = useState(yAxisOptions?.min);

    const isPie = Boolean(chartType && chartBitsUtils.baseOn(chartType, ChartTypeBits.Pie));
    const collapseItems = [
        {
            label: '图表样式',
            children: (
                <section>
                    <div className={styles.styleTabPanelRow}>
                        <div className={styles.styleTabPanelRowHalf}>
                            <div className={styles.styleTabPanelLabel}>背景颜色</div>
                            <ColorPickerControl color={backgroundColor} onChange={setBackgroundColor} />
                        </div>
                        <div className={styles.styleTabPanelRowHalf}>
                            <div className={styles.styleTabPanelLabel}>图标边框颜色</div>
                            <ColorPickerControl color={borderColor} onChange={setBorderColor} />
                        </div>
                    </div>
                    {/* <div className={styles.styleTabPanelRow}>
                        <div className={styles.styleTabPanelRowHalf}>
                            <div className={styles.styleTabPanelLabel}>字体大小</div>
                            <div className={styles.styleTabPanelFontSizeBar}>
                                <Button
                                    type="text"
                                    className={styles.styleTabPanelFontSizeBtn}
                                    onClick={() => {
                                        setFontSize(fontSize - 1);
                                        setTitleFontSize(titleFontSize - 1);
                                    }}
                                >
                                    <FontSizeReduceSingle />
                                </Button>
                                <Button
                                    type="text"
                                    className={styles.styleTabPanelFontSizeBtn}
                                    onClick={() => {
                                        setFontSize(fontSize + 1);
                                        setTitleFontSize(titleFontSize + 1);
                                    }}
                                >
                                    <FontSizeIncreaseSingle />
                                </Button>
                            </div>
                        </div>
                    </div> */}
                </section>
            ),
        },
        {
            label: '图标和轴标题',
            children: (
                <section>
                    <Select className="chart-edit-panel-select" value={titleType} options={titleOptions as unknown as Array<{ label: string; value: string }>} onChange={(value) => setTitleType(value as TitleOptionValue)}></Select>
                    <div>
                        <div className={clsx(styles.styleTabPanelLabel, styles.styleTabPanelLabelGap)}>标题文本</div>
                        <Input
                            value={content}
                            onChange={setContent}
                            onBlur={() => {
                                if (content !== currentTitleStyle?.content) {
                                    setCurrentTitleStyle({ ...currentTitleStyle, content });
                                }
                            }}
                        />
                    </div>
                    <div>
                        <div className={clsx(styles.styleTabPanelLabel, styles.styleTabPanelLabelGap)}>标题格式</div>
                        <div className={styles.styleTabPanelFontStyleBar}>
                            <FontFormatBar {...currentTitleStyle} onChange={(key, value) => setCurrentTitleStyle({ [key]: value })} />
                        </div>
                    </div>
                </section>
            ),
        },
        !isPie && {
            label: '系列',
            children: (
                <SeriesStyleEdit chartType={chartType} service={sheetsChartUIService} />
            ),
        },
        isPie && {
            label: '饼图',
            children: <PieChartStyleEdit chartType={chartType} service={sheetsChartUIService} />,
        },
        {
            label: '图例',
            children: (
                <section>
                    <div>
                        <div>
                            <h5>Position</h5>
                            <Select value={legendStyle?.position ?? defaultChartStyle.legend.position} onChange={(position) => setLegendStyle({ position: position as LegendPosition })} options={legendLabelPositionOptions} />
                        </div>
                        <div>
                            <h5>Title Format</h5>
                            <FontFormatBar
                                {...legendStyle?.label}
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
            label: '横轴',
            children: (
                <section>
                    <div>
                        <h5>Axis Options</h5>
                        <div>
                            <div className={styles.styleTabPanelRow}>
                                <Checkbox className={styles.styleTabPanelRowHalf} checked={xAxisOptions?.labelVisible ?? defaultChartStyle.axis.labelVisible} onChange={(checked) => setXAxisOptions({ labelVisible: Boolean(checked) })}>Show Labels</Checkbox>
                                <Checkbox className={styles.styleTabPanelRowHalf} checked={xAxisOptions?.reverse ?? defaultChartStyle.axis.reverse} onChange={(checked) => setXAxisOptions({ reverse: Boolean(checked) })}>Reverse axis order</Checkbox>
                            </div>
                            <Checkbox className="chart-edit-panel-top-gap" checked={xAxisOptions?.lineVisible ?? defaultChartStyle.axis.lineVisible} onChange={(checked) => setXAxisOptions({ lineVisible: Boolean(checked) })}>Show axis line</Checkbox>
                        </div>
                        <FontFormatBar
                            className="chart-edit-panel-top-gap"
                            {...xAxisOptions?.label}
                            fontSize={xAxisOptions?.label?.fontSize ?? defaultChartStyle.textStyle.fontSize}
                            color={xAxisOptions?.label?.color ?? defaultChartStyle.textStyle.color}
                            onChange={(name, value) => setXAxisOptions({ label: { [name]: value } })}
                        />
                    </div>
                </section>
            ),
        },
        {
            label: '横轴',
            children: (
                <section>
                    <div>
                        <h5>Axis Options</h5>
                        <div>
                            <div className={styles.styleTabPanelRow}>
                                <Checkbox className={styles.styleTabPanelRowHalf} checked={xAxisOptions?.labelVisible ?? defaultChartStyle.axis.labelVisible} onChange={(checked) => setXAxisOptions({ labelVisible: Boolean(checked) })}>Show Labels</Checkbox>
                                <Checkbox className={styles.styleTabPanelRowHalf} checked={xAxisOptions?.reverse ?? defaultChartStyle.axis.reverse} onChange={(checked) => setXAxisOptions({ reverse: Boolean(checked) })}>Reverse axis order</Checkbox>
                            </div>
                            <Checkbox className="chart-edit-panel-top-gap" checked={xAxisOptions?.lineVisible ?? defaultChartStyle.axis.lineVisible} onChange={(checked) => setXAxisOptions({ lineVisible: Boolean(checked) })}>Show axis line</Checkbox>
                        </div>
                        <FontFormatBar
                            className="chart-edit-panel-top-gap"
                            {...xAxisOptions?.label}
                            fontSize={xAxisOptions?.label?.fontSize ?? defaultChartStyle.textStyle.fontSize}
                            color={xAxisOptions?.label?.color ?? defaultChartStyle.textStyle.color}
                            onChange={(name, value) => setXAxisOptions({ label: { [name]: value } })}
                        />
                    </div>
                </section>
            ),
        },
        {
            label: '竖轴',
            children: (
                <section>
                    <div>
                        <h5>Axis Options</h5>
                        <div className={clsx(styles.styleTabPanelRow, '')}>
                            <Checkbox className={styles.styleTabPanelRowHalf} checked={yAxisOptions?.labelVisible ?? defaultChartStyle.axis.labelVisible} onChange={(checked) => setYAxisOptions({ labelVisible: Boolean(checked) })}>Show Labels</Checkbox>
                            <Checkbox className={styles.styleTabPanelRowHalf} checked={yAxisOptions?.lineVisible ?? defaultChartStyle.axis.lineVisible} onChange={(checked) => setYAxisOptions({ lineVisible: Boolean(checked) })}>Show axis line</Checkbox>
                        </div>
                        <FontFormatBar
                            className="chart-edit-panel-top-gap"
                            {...yAxisOptions?.label}
                            fontSize={yAxisOptions?.label?.fontSize ?? defaultChartStyle.textStyle.titleFontSize}
                            color={yAxisOptions?.label?.color ?? defaultChartStyle.textStyle.color}
                            onChange={(name, value) => setYAxisOptions({ label: { [name]: value } })}
                        />
                        <div className={clsx(styles.styleTabPanelRow, '')}>
                            <div className={styles.styleTabPanelRowHalf}>
                                <div>Min</div>
                                <InputNumber
                                    controls={false}
                                    value={yAxisMin}
                                    onChange={(v) => setYAxisMin(v ?? undefined)}
                                    onBlur={() => setYAxisOptions({ min: yAxisMin })}
                                    onPressEnter={() => setYAxisOptions({ min: yAxisMin })}
                                >
                                </InputNumber>
                            </div>
                            <div className={styles.styleTabPanelRowHalf}>
                                <div>Max</div>
                                <InputNumber
                                    controls={false}
                                    value={yAxisMax}
                                    onChange={(v) => setYAxisMax(v ?? undefined)}
                                    onBlur={() => setYAxisOptions({ max: yAxisMax })}
                                    onPressEnter={() => setYAxisOptions({ max: yAxisMax })}
                                >
                                </InputNumber>
                            </div>
                        </div>
                    </div>
                </section>
            ),
        },
        {
            label: '网格与刻度标记',
            children: (
                <section>
                    <div className="chart-edit-panel-top-gap">
                        <h5>Select one</h5>
                        <Select className="chart-edit-panel-select" options={axisListOptions} value={currentAxisId} onChange={setCurrentAxisId}></Select>
                    </div>
                    <GridLineAndTickOptions
                        className="chart-edit-panel-top-gap"
                        onChange={(name, value) => setGridLineStyle({ [name === 'gridLine' ? 'visible' : name]: value })}
                        color={gridLineStyle?.color}
                        gridLine={gridLineStyle?.visible ?? defaultChartStyle.axis.gridLineVisible}
                        width={gridLineStyle?.width}
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
