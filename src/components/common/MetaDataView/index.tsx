import { ExifRow } from 'types';
import ExifDataTree from '../old/IceContainer/ExifAnalyzer/ExifDataTree/ExifDataTree';
import { Collapse } from 'antd';
import CollapsePanel from 'antd/es/collapse/CollapsePanel';

interface Props {
  exifRow: ExifRow[];
}

const MetaDataView: React.FC<Props> = ({ exifRow }) => {
  return (
    <>
      {/* <Collapse defaultActiveKey={[]}>
        <CollapsePanel header="This is panel header 1" key="1">
          <p>2141234</p>
        </CollapsePanel>
        <CollapsePanel header="This is panel header 2" key="2">
          <p>2141234</p>
        </CollapsePanel>
        <CollapsePanel header="This is panel header 3" key="3">
          <p>2141234</p>
        </CollapsePanel>
      </Collapse> */}
      {/* <ExifDataTree rows={exifRow} /> */}
      {/* {JSON.stringify(exifRow)} */}
    </>
  );
};

export default MetaDataView;
