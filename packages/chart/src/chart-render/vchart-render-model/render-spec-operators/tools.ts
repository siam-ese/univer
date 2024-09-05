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
import type { ILabelStyle } from '../../../chart/style.types';
import type { VChartSpec } from '../vchart-render-engine';

type PartialLabelStyle = Partial<Pick<ILabelStyle, 'color' | 'fontSize' | 'italic' | 'bold' | 'underline' | 'strikethrough'>>;
export function applyLabelStyle(spec: VChartSpec, path: string, labelStyle: PartialLabelStyle): void {
    Tools.set(spec, `${path}.fill`, labelStyle.color);
    Tools.set(spec, `${path}.fontSize`, labelStyle.fontSize);
    Tools.set(spec, `${path}.fontStyle`, labelStyle.italic ? 'italic' : 'normal');
    Tools.set(spec, `${path}.fontWeight`, labelStyle.bold ? 'bold' : 'normal');
    Tools.set(spec, `${path}.underline`, Boolean(labelStyle.underline));
    Tools.set(spec, `${path}.lineThrough`, Boolean(labelStyle.strikethrough));
}
