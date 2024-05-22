import { ExifRow } from 'types';

interface Props {
  exifRow: ExifRow[];
}

const MetaDataView: React.FC<Props> = ({ exifRow }) => {
  return <>{JSON.stringify(exifRow)}</>;
};

export default MetaDataView;
