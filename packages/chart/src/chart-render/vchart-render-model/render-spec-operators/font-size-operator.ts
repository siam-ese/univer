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

const { textStyle } = defaultChartStyle;
export const fontSizeOperator: VChartRenderSpecOperator = (spec, style) => {
    const commonStyle = style.common;
    const fontSize = commonStyle?.fontSize ?? textStyle.fontSize;

    Tools.set(spec, 'title.textStyle.fontSize', fontSize);
    spec.axes?.forEach((axis) => {
        Tools.set(axis, 'label.style.fontSize', fontSize);
        Tools.set(axis, 'title.style.fontSize', fontSize);
    });
    // spec.background = commonStyle?.fontSize;

    return spec;
};
