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
import type { VChartRenderSpecInterceptor } from '../render-engine';
import { defaultChartStyle } from '../../chart/constants/default-chart-style';

const { textStyle } = defaultChartStyle;
export const titleStyleInterceptor: VChartRenderSpecInterceptor = (spec, style) => {
    const commonStyle = style.common;
    const titleStyle = commonStyle?.title;

    Tools.set(spec, 'title.text', titleStyle?.content ?? '');
    Tools.set(spec, 'title.align', titleStyle?.align ?? textStyle.align);
    Tools.set(spec, 'title.textStyle.fill', titleStyle?.color ?? textStyle.color);
    Tools.set(spec, 'title.textStyle.fontWeight', titleStyle?.bold ? 'bold' : 'normal');
    Tools.set(spec, 'title.textStyle.fontStyle', titleStyle?.italic ? 'italic' : 'normal');
    Tools.set(spec, 'title.textStyle.lineThrough', !!titleStyle?.strikethrough);
    Tools.set(spec, 'title.textStyle.underline', !!titleStyle?.underline);

    return spec;
};
