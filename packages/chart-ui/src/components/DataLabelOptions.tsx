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

import { Checkbox, Select } from '@univerjs/design';
import React, { useCallback, useMemo } from 'react';
import type { IPieLabelStyle, ISeriesLabelStyle } from '@univerjs/chart';
import { chartBitsUtils, LabelContentType } from '@univerjs/chart';
import type { LocaleService } from '@univerjs/core';
import type { OptionType } from './options';
import { labelContentTypeList } from './options';
import type { IFontFormatBarProps, PropertyChangeFunction } from './font-format-bar';
import { FontFormatBar } from './font-format-bar';

type UnionLabelStyle = ISeriesLabelStyle | IPieLabelStyle;

export interface IDataLabelOptionsProps {
    localeService: LocaleService;
    fallbackLabelStyle?: Partial<UnionLabelStyle>;
    labelStyle: Partial<UnionLabelStyle>;
    contentTypeOptions?: OptionType[];
    positionOptions?: OptionType[];
    onVisibleChange?: (visible: boolean) => void;
    onLabelStyleChange?: PropertyChangeFunction<UnionLabelStyle>;
}

export const DataLabelOptions = (props: IDataLabelOptionsProps) => {
    const {
        fallbackLabelStyle,
        labelStyle,
        positionOptions,
        contentTypeOptions,
        onLabelStyleChange,
        onVisibleChange,
        localeService,
    } = props;
    const mergedLabelStyle = { ...fallbackLabelStyle, ...labelStyle };

    const { contentType } = mergedLabelStyle;
    const contentTypes = useMemo(() => {
        if (!contentType) {
            return [];
        }

        const contentTypes = labelContentTypeList.filter((type) => chartBitsUtils.has(contentType, type));

        return contentTypes.map((type) => String(type));
    }, [contentType]);

    const handleContentTypeChange = useCallback((_values: string[]) => {
        const values = _values.map((value) => Number(value));
        if (values.length <= 0) {
            return;
        }
        const contentType = values.length > 0
            ? values.reduce((a, b) => a | b)
            : LabelContentType.Empty;

        onLabelStyleChange?.('contentType', contentType);
    }, [onLabelStyleChange]);
    const { t } = localeService;
    return (
        <div>
            <div>
                <Checkbox
                    checked={mergedLabelStyle.visible ?? false}
                    onChange={(visible) => {
                        onVisibleChange?.(Boolean(visible));
                    }}
                >
                    {t('chart.styleEditPanel.showDataLabels')}
                </Checkbox>
            </div>
            {mergedLabelStyle.visible && (
                <>
                    <div className="chart-edit-panel-row">
                        <div className="chart-edit-panel-row-half">
                            <h5>{t('chart.styleEditPanel.labelPosition')}</h5>
                            <Select value={mergedLabelStyle.position ?? ''} onChange={(value) => onLabelStyleChange?.('position', value)} options={positionOptions}></Select>
                        </div>
                        {contentTypeOptions && (
                            <div className="chart-edit-panel-row-half">
                                <h5>{t('chart.styleEditPanel.labelText')}</h5>
                                <Select
                                    mode="multiple"
                                    size="small"
                                    className="chart-edit-panel-select"
                                // @ts-ignore select supports multiple mode but the type definition is not correct
                                    value={contentTypes}
                                    options={contentTypeOptions}
                                // @ts-ignore select supports multiple mode but the type definition is not correct
                                    onChange={handleContentTypeChange}
                                >
                                </Select>
                            </div>
                        )}

                    </div>
                    <div>
                        <h5>{t('chart.titles.titleText')}</h5>
                        <FontFormatBar {...mergedLabelStyle} localeService={localeService} onChange={onLabelStyleChange as unknown as IFontFormatBarProps['onChange']} />
                    </div>
                </>
            )}
        </div>
    );
};
