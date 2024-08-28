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

import { Button, Checkbox, ColorPicker, Dropdown, Input, InputNumber, Select } from '@univerjs/design';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChartBorderDashType, DeepPartial, IGridLineStyle, ISeriesStyle, LegendPosition } from '@univerjs/chart';
import { defaultChartStyle } from '@univerjs/chart';
import { useChartConfigState, useSheetsChartUIService } from '../../hooks';
import type { TextAlignOptionValue, TitleOptionValue } from '../options';
import { axisListOptions, borderDashTypeOptions, borderWidthOptions, fontSizeOptions, getAllSeriesOption, legendLabelPositionOptions, lineOpacityOptions, textAlignOptions, titleOptions } from '../options';
import { FontFormatBar } from '../font-format-bar';
import { GridLineAndTickOptions } from '../grid-line-and-tick-options/GridLineAndTickOptions';
import styles from './index.module.less';
import { DataLabelOptions } from './DataLabelOptions';

const { textStyle } = defaultChartStyle;

export const StyleTabPanel = () => {
    const sheetsChartUIService = useSheetsChartUIService();
    // const univerInstanceService = useDependency(IUniverInstanceService);
    // const unitId = getUnitId(univerInstanceService);
    // const subUnitId = getSubUnitId(univerInstanceService);
    const [backgroundColor, setBackgroundColor] = useChartConfigState('backgroundColor', sheetsChartUIService, '');
    const [borderColor, setBorderColor] = useChartConfigState('borderColor', sheetsChartUIService, '');
    const [fontSize, setFontSize] = useChartConfigState('fontSize', sheetsChartUIService, textStyle.fontSize);
    const [seriesList] = useChartConfigState('seriesList', sheetsChartUIService);
    const [allSeriesStyle, setAllSeriesStyle] = useChartConfigState('allSeriesStyle', sheetsChartUIService);
    const [seriesStyleMap, setSeriesStyleMap] = useChartConfigState('seriesStyleMap', sheetsChartUIService);
    const [legendStyle, setLegendStyle] = useChartConfigState('legendStyle', sheetsChartUIService);
    const [xAxisOptions, setXAxisOptions] = useChartConfigState('xAxisOptions', sheetsChartUIService);
    const [yAxisOptions, setYAxisOptions] = useChartConfigState('yAxisOptions', sheetsChartUIService);

    const [titleType, setTitleType] = useState<TitleOptionValue>(titleOptions[0].value);
    const [currentTitleStyle, setCurrentTitleStyle] = useChartConfigState(titleType, sheetsChartUIService);
    const seriesOptions = useMemo(() => seriesList ? [getAllSeriesOption(), ...seriesList] : [], [seriesList]);

    const [content, setContent] = useState('');
    const [currentAxisId, setCurrentAxisId] = useState<string>(axisListOptions[0].value);
    const [currentSeriesId, setCurrentSeriesId] = useState<string>(defaultChartStyle.allSeriesId);

    const gridLineStyle = currentAxisId === 'xAxis' ? xAxisOptions?.gridLine : yAxisOptions?.gridLine;
    const setGridLineStyle = useCallback((gridLineStyle: Partial<IGridLineStyle>) => {
        if (currentAxisId === 'xAxis') {
            setXAxisOptions({ gridLine: gridLineStyle });
        } else {
            setYAxisOptions({ gridLine: gridLineStyle });
        }
    }, [currentAxisId]);

    const currentSeriesStyle = seriesStyleMap?.get(currentSeriesId);
    const setCurrentSeriesStyle = useCallback((style: DeepPartial<ISeriesStyle>) => {
        seriesStyleMap?.set(currentSeriesId, style);
    }, [currentSeriesId, seriesStyleMap]);

    const setSeriesStyle = currentSeriesId === defaultChartStyle.allSeriesId ? setAllSeriesStyle : setCurrentSeriesStyle;

    // const [currsentSeriesStyle, setCurrentSeriesStyle] = currentSeriesId === defaultChartStyle.allSeriesId
    // ? useChartConfigState('allSeriesStyle', sheetsChartUIService);
    // : useChartConfigState('seriesStyleMap', sheetsChartUIService);

    useEffect(() => {
        const titleContent = currentTitleStyle?.content;
        if (titleContent) {
            setContent(titleContent);
        }
    }, [currentTitleStyle?.content]);

    // const innerLineOpacityOptions =  useMemo(() => lineOpacityOptions.map(item => ({
    //     ...item,
    //     value: String(item.value)
    // })), [])

    const defaultBorderStyle = defaultChartStyle.borderStyle;
    const borderStyle: ISeriesStyle['border'] = Object.assign({
        color: 'transparent',
        opacity: defaultBorderStyle.opacity,
        width: defaultBorderStyle.width,
        dashType: defaultBorderStyle.dashType,
    }, allSeriesStyle?.border, currentSeriesStyle?.border);

    const labelStyle: Partial<ISeriesStyle['label']> = Object.assign({}, allSeriesStyle?.label, currentSeriesStyle?.label);

    const [yAxisMax, setYAxisMax] = useState(yAxisOptions?.max);
    const [yAxisMin, setYAxisMin] = useState(yAxisOptions?.min);
    // console.log('legendStyle', legendStyle);
    // console.log('labelStyle', labelStyle);
    // const [chartType, setChartType] = useChartConfigState('chartType', sheetsChartUIService, ChartType.Line);
    return (
        <div>
            <section>
                <h2>图表样式</h2>
                <div>
                    <span>背景颜色</span>
                    <Dropdown overlay={<div><ColorPicker onChange={setBackgroundColor} /></div>}>
                        <span>
                            <Button>
                                <div style={{ backgroundColor, width: '16px', height: '16px' }}></div>
                            </Button>
                        </span>
                    </Dropdown>

                </div>
                <div>
                    <span>图标边框颜色</span>
                    <Dropdown overlay={<div><ColorPicker onChange={setBorderColor} /></div>}>
                        <span>
                            <Button>
                                <div style={{ backgroundColor: borderColor, width: '16px', height: '16px' }}></div>
                            </Button>
                        </span>
                    </Dropdown>
                </div>
                <div>
                    <span>字体大小</span>
                    <Button onClick={() => setFontSize(fontSize - 1)}>-</Button>
                    <Button onClick={() => setFontSize(fontSize + 1)}>+</Button>
                </div>
            </section>
            <section>
                <h2>图标和轴标题</h2>
                <Select value={titleType} options={titleOptions as unknown as Array<{ label: string; value: string }>} onChange={(value) => setTitleType(value as TitleOptionValue)}></Select>
                <div>
                    <span>标题文本</span>
                    <Input
                        value={content}
                        onChange={setContent}
                        onBlur={() => {
                            setCurrentTitleStyle({ ...currentTitleStyle, content });
                        }}
                    />
                </div>
                <div>
                    <span>标题格式</span>
                    <div className={styles.styleTabPanelFontStyleBar}>
                        <Select
                            value={currentTitleStyle?.fontSize !== undefined ? String(currentTitleStyle.fontSize) : String(textStyle.fontSize)}
                            options={fontSizeOptions as unknown as Array<{ label: string; value: string }>}
                            onChange={(v) => setCurrentTitleStyle({ ...currentTitleStyle, fontSize: Number(v) })}
                        >
                        </Select>

                        <Dropdown overlay={<div><ColorPicker color={currentTitleStyle?.color ?? textStyle.color} onChange={(color) => setCurrentTitleStyle({ ...currentTitleStyle, color })} /></div>}>
                            <span>
                                <Button>
                                    <div style={{ backgroundColor: currentTitleStyle?.color ?? textStyle.color, width: '16px', height: '16px' }}></div>
                                </Button>
                            </span>
                        </Dropdown>
                        <Button size="small" onClick={() => setCurrentTitleStyle({ ...currentTitleStyle, bold: !currentTitleStyle?.bold })} type={currentTitleStyle?.bold ? 'primary' : 'text'}>加粗</Button>
                        <Button size="small" onClick={() => setCurrentTitleStyle({ ...currentTitleStyle, strikethrough: !currentTitleStyle?.strikethrough })} type={currentTitleStyle?.strikethrough ? 'primary' : 'text'}>中划线</Button>
                        <Button size="small" onClick={() => setCurrentTitleStyle({ ...currentTitleStyle, italic: !currentTitleStyle?.italic })} type={currentTitleStyle?.italic ? 'primary' : 'text'}>斜体</Button>
                        <Button size="small" onClick={() => setCurrentTitleStyle({ ...currentTitleStyle, underline: !currentTitleStyle?.underline })} type={currentTitleStyle?.underline ? 'primary' : 'text'}>下划线</Button>
                    </div>
                    <div>
                        <Select onChange={(align) => setCurrentTitleStyle({ ...currentTitleStyle, align: align as TextAlignOptionValue })} value={currentTitleStyle?.align ?? textStyle.align} options={textAlignOptions as unknown as Array<{ label: string; value: string }>}></Select>
                    </div>
                </div>
            </section>
            <section>
                <h2>系列</h2>
                <Select value={currentSeriesId} onChange={(id) => setCurrentSeriesId(id)} options={seriesOptions}></Select>
                <div>
                    {/* <span>格式</span> */}
                    <div>
                        <span>Border Color</span>
                        <Dropdown overlay={(
                            <div>
                                <ColorPicker
                                    color={borderStyle?.color}
                                    onChange={(color) => setSeriesStyle({ border: { color } })}
                                />
                            </div>
                        )}
                        >
                            <span>
                                <Button>
                                    <div style={{ backgroundColor: borderStyle?.color, width: '16px', height: '16px' }}></div>
                                </Button>
                            </span>
                        </Dropdown>
                    </div>
                    <div>
                        <span>Border Opacity</span>
                        <Select value={String(borderStyle?.opacity)} options={lineOpacityOptions} onChange={(v) => setSeriesStyle({ border: { opacity: Number(v) } })}></Select>

                    </div>
                    <div>
                        <span>Dash type</span>
                        <Select value={borderStyle?.dashType} options={borderDashTypeOptions} onChange={(v) => setSeriesStyle({ border: { dashType: v as ChartBorderDashType } })}></Select>
                    </div>
                    <div>
                        <span>Line thickness</span>
                        <Select value={String(borderStyle?.width)} options={borderWidthOptions} onChange={(v) => setSeriesStyle({ border: { width: Number(v) } })}></Select>
                    </div>
                </div>
                <div>
                    <Checkbox checked={labelStyle.visible} onChange={(visible) => setSeriesStyle({ label: { visible: Boolean(visible) } })}>Show data labels</Checkbox>
                    {labelStyle.visible && <DataLabelOptions />}
                </div>
            </section>
            <section>
                <h2>图例</h2>
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
            <section>
                <h2>横轴</h2>
                <div>
                    <h5>Axis Options</h5>
                    <div>
                        <Checkbox checked={xAxisOptions?.labelVisible ?? defaultChartStyle.axis.labelVisible} onChange={(checked) => setXAxisOptions({ labelVisible: Boolean(checked) })}>Show Labels</Checkbox>
                        <Checkbox checked={xAxisOptions?.reverse ?? defaultChartStyle.axis.reverse} onChange={(checked) => setXAxisOptions({ reverse: Boolean(checked) })}>Reverse axis order</Checkbox>
                        <Checkbox checked={xAxisOptions?.lineVisible ?? defaultChartStyle.axis.lineVisible} onChange={(checked) => setXAxisOptions({ lineVisible: Boolean(checked) })}>Show axis line</Checkbox>
                    </div>
                    <FontFormatBar
                        {...xAxisOptions?.label}
                        fontSize={xAxisOptions?.label?.fontSize ?? defaultChartStyle.textStyle.fontSize}
                        color={xAxisOptions?.label?.color ?? defaultChartStyle.textStyle.color}
                        onChange={(name, value) => setXAxisOptions({ label: { [name]: value } })}
                    />
                </div>
            </section>
            <section>
                <h2>竖轴</h2>
                <div>
                    <h5>Axis Options</h5>
                    <div>
                        <Checkbox checked={yAxisOptions?.labelVisible ?? defaultChartStyle.axis.labelVisible} onChange={(checked) => setYAxisOptions({ labelVisible: Boolean(checked) })}>Show Labels</Checkbox>
                        <Checkbox checked={yAxisOptions?.lineVisible ?? defaultChartStyle.axis.lineVisible} onChange={(checked) => setYAxisOptions({ lineVisible: Boolean(checked) })}>Show axis line</Checkbox>
                    </div>
                    <FontFormatBar
                        {...yAxisOptions?.label}
                        fontSize={yAxisOptions?.label?.fontSize ?? defaultChartStyle.textStyle.fontSize}
                        color={yAxisOptions?.label?.color ?? defaultChartStyle.textStyle.color}
                        onChange={(name, value) => setYAxisOptions({ label: { [name]: value } })}
                    />
                    <div>
                        <div>
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
                        <div>
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
            <section>
                <h2>网格与刻度标记</h2>
                <div>
                    <h5>Select one</h5>
                    <Select options={axisListOptions} value={currentAxisId} onChange={setCurrentAxisId}></Select>
                </div>
                <GridLineAndTickOptions
                    onChange={(name, value) => setGridLineStyle({ [name === 'gridLine' ? 'visible' : name]: value })}
                    color={gridLineStyle?.color}
                    gridLine={gridLineStyle?.visible ?? defaultChartStyle.axis.gridLineVisible}
                    width={gridLineStyle?.width}
                />
            </section>
        </div>
    );
};
