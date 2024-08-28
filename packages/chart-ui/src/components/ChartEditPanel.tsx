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

import { Button } from '@univerjs/design';
import React, { useState } from 'react';
import { DataTabPanel } from './DataTabPanel';
import { StyleTabPanel } from './style-tab-panel';

export const ChartEditPanel = () => {
    const [tab, setTab] = useState(1);
    return (
        <div>
            <div>
                <Button onClick={() => setTab(0)}>Data Panel</Button>
                <Button onClick={() => setTab(1)}>Style Panel</Button>
            </div>
            <div>
                {tab === 0 ? <DataTabPanel /> : <StyleTabPanel />}
            </div>
        </div>
    );
};
