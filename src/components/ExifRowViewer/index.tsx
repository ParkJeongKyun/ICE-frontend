import Collapse from 'components/common/Collapse';
import React, { useMemo } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  ViewerDiv,
} from './index.styles';
import { TabData, TabKey } from 'types';
import { getDate } from 'utils/getDate';
import { getBytes } from 'utils/getBytes';

interface Props {
  activeKey: TabKey;
  datas: TabData;
}

const ExifRowViewer: React.FC<Props> = ({ activeKey, datas }) => {
  const activeItem = useMemo(() => datas.get(activeKey), [datas, activeKey]);

  return (
    <>
      <ViewerDiv>
        {activeItem?.fileinfo && (
          <Collapse
            title="File Info"
            children={
              <>
                <ContentDiv>
                  <CellHeaderDiv>Name</CellHeaderDiv>
                  <CellBodyDiv>{activeItem.fileinfo.name}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>LastModified</CellHeaderDiv>
                  <CellBodyDiv>
                    {getDate(activeItem.fileinfo.lastModified)}
                  </CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>Size</CellHeaderDiv>
                  <CellBodyDiv>
                    {getBytes(activeItem.fileinfo.size)}
                  </CellBodyDiv>
                </ContentDiv>
              </>
            }
            open
          />
        )}
        {activeItem?.rows && (
          <Collapse
            title="Exif Data"
            children={
              <>
                {activeItem.rows.map((item, index) => (
                  <>
                    <ContentDiv>
                      <CellHeaderDiv>{item.name.split('(')[0]}</CellHeaderDiv>
                      <CellBodyDiv>{item.data}</CellBodyDiv>
                    </ContentDiv>
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
