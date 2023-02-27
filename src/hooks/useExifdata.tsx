import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "store";
import { Exifdata, initialStateExifdata, exifdataActions } from "store/exifdataSlice";

export default function useExifdata() {
  const exifdata = useAppSelector((state) => state.exifdata);
  const initExifdata = initialStateExifdata;
  const dispatch = useAppDispatch();

  const setExifdata = useCallback(
    (value: Exifdata) => dispatch(exifdataActions.setExifdata(value)),
    [dispatch]
  );

  return {
    exifdata, initExifdata, dispatch, setExifdata
  };
}
