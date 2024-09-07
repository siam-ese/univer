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

import { Select } from '@univerjs/design';
import React from 'react';
import { dataLabelPositionOptions } from '../options';

export const DataLabelOptions = () => {
    return (
        <div>
            <div>
                <h4>Label Position</h4>
                <Select value="" onChange={() => {}} options={dataLabelPositionOptions}></Select>
            </div>
            <div>
                <h4>Title Format</h4>
                {/* <FontFormatBar /> */}
            </div>
        </div>
    );
};
