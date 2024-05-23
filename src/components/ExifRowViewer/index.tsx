import Collapse from 'components/common/Collapse';
import React, { useMemo } from 'react';
import { CellDiv, ContentDiv, ViewerDiv } from './index.styles';
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
                  <CellDiv isHeader>Name</CellDiv>
                  <CellDiv>{activeItem.fileinfo.name}</CellDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellDiv isHeader>LastModified</CellDiv>
                  <CellDiv>{getDate(activeItem.fileinfo.lastModified)}</CellDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellDiv isHeader>Size</CellDiv>
                  <CellDiv>{getBytes(activeItem.fileinfo.size)}</CellDiv>
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
                {activeItem.rows.map((item) => (
                  <>
                    <ContentDiv>
                      <CellDiv isHeader>{item.name}</CellDiv>
                      <CellDiv>{item.data}</CellDiv>
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
