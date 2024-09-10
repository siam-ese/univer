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

import { Tools } from '@univerjs/core';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { applyLabelStyle } from './tools';

const { textStyle } = defaultChartStyle;
export const titleStyleOperator: VChartRenderSpecOperator = (spec, style, config) => {
    const titleStyle = style?.title;

    const titleContent = titleStyle?.content ?? config.headers?.join(',');

    Tools.set(spec, 'title.visible', Boolean(titleContent));
    Tools.set(spec, 'title.text', titleContent);
    Tools.set(spec, 'title.align', titleStyle?.align ?? textStyle.align);
    applyLabelStyle(spec, 'title.textStyle', {
        ...titleStyle,
        color: titleStyle?.color ?? textStyle.color,
    });

    return spec;
};
