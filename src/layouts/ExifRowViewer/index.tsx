import Collapse from 'components/common/Collapse';
import { TabData, TabKey } from 'layouts';
import React, { useMemo } from 'react';
import { ViewerDiv } from './index.styles';

interface Props {
  activeKey: TabKey;
  datas: TabData;
}

const ExifRowViewer: React.FC<Props> = ({ activeKey, datas }) => {
  const activeItem = useMemo(() => datas.get(activeKey), [datas, activeKey]);

  return (
    <>
      <ViewerDiv>
        {activeItem?.rows && (
          <Collapse
            title="EXIF"
            children={
              <>
                {activeItem.rows.map((item) => (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div>{item.name}</div>
                      <div>{item.data}</div>
                    </div>
                  </>
                ))}
              </>
            }
            open
          />
        )}
      </ViewerDiv>
    </>
  );
};

export default React.memo(ExifRowViewer);
