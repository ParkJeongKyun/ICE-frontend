import { IceModalS } from "./styles";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { ReactNode, useRef, useState } from "react";

interface Props {
  title: string | ReactNode;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  children: JSX.Element | JSX.Element[];
}

export default function IceModal({
  title,
  open,
  onOk,
  onCancel,
  children,
}: Props) {
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef<HTMLDivElement>(null);

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <IceModalS
      title={
        <div
          style={{
            width: "100%",
            cursor: "move",
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          // fix eslintjsx-a11y/mouse-events-have-key-events
          // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
          onFocus={() => {}}
          onBlur={() => {}}
          // end
        >
          {title}
        </div>
      }
      mask={false}
      maskClosable={false}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
          nodeRef={draggleRef}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      {children}
    </IceModalS>
  );
}
