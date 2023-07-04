import React, { useRef, useState, useEffect } from "react";
import { useSpring, a } from "@react-spring/web";
import useMeasure from "react-use-measure";
import { Container, Title, Frame, Content, toggle } from "./styles";
import * as Icons from "./icons";
import { ExifRow } from "types/types";
import KakaoMap from "IceContainer/ExifAnalyzer/KakaoMap/KakaoMap";

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
}

const Tree = React.memo<
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean;
    name: string | JSX.Element;
  }
>(({ children, name, style, defaultOpen = false }) => {
  const [isOpen, setOpen] = useState(defaultOpen);
  const previous = usePrevious(isOpen);
  const [ref, { height: viewHeight }] = useMeasure();
  const { height, opacity, y } = useSpring({
    from: { height: 0, opacity: 0, y: 0 },
    to: {
      height: isOpen ? viewHeight : 0,
      opacity: isOpen ? 1 : 0,
      y: isOpen ? 0 : 20,
    },
  });
  // @ts-ignore
  const Icon =
    Icons[`${children ? (isOpen ? "Minus" : "Plus") : "Close"}SquareO`];
  return (
    <Frame>
      <Icon
        style={{ ...toggle, opacity: children ? 1 : 0.3 }}
        // style={{ ...toggle }}
        onClick={() => setOpen(!isOpen)}
      />
      <Title style={style}>{name}</Title>
      <Content
        style={{
          opacity,
          height: isOpen && previous === isOpen ? "auto" : height,
        }}
      >
        <a.div ref={ref} style={{ y }} children={children} />
      </Content>
    </Frame>
  );
});

interface Props {
  rows: ExifRow[];
}

export default function ExifDataTree({ rows }: Props) {
  return (
    <>
      <Container>
        {rows.length > 0 ? (
          <Tree name="이미지 EXIF 메타데이터" defaultOpen>
            {rows
              .filter((item) => item.data != "")
              .map((item, index) => {
                const kor_name = item.name;
                const data = item.data;
                const origindata = item.origindata;
                const meta = item.meta;

                const type = item.type;
                const unit = item.unit;
                const comment = item.comment;
                const example = item.example;

                return (
                  <Tree
                    key={index}
                    name={kor_name}
                    style={{ color: "var(--ice-main-color)" }}
                    defaultOpen
                  >
                    {meta == "Location" && (
                      <>
                        <KakaoMap
                          latitude={origindata.split(",")[0].trim()}
                          longitude={origindata.split(",")[1].trim()}
                        />
                      </>
                    )}
                    <Tree key={`${index}-data`} name={data}>
                      <Tree
                        key={`${index}-meta`}
                        name={"[영문] " + meta}
                      ></Tree>
                      <Tree
                        key={`${index}-comment`}
                        name={"[설명] " + comment}
                      ></Tree>
                      <Tree
                        key={`${index}-type`}
                        name={"[타입] " + (type || "없음")}
                      ></Tree>
                      <Tree
                        key={`${index}-unit`}
                        name={"[단위] " + (unit || "없음")}
                      ></Tree>
                      <Tree
                        key={`${index}-origindata`}
                        name={"[원본] " + origindata}
                      ></Tree>
                      {example && (
                        <Tree
                          key={`${index}-example`}
                          name="[예제값들]"
                          defaultOpen
                        >
                          {Object.keys(example).map((key, index) => (
                            <Tree
                              key={`${index}-example-${index}`}
                              name={key + " = " + example[key]}
                            ></Tree>
                          ))}
                        </Tree>
                      )}
                    </Tree>
                  </Tree>
                );
              })}
          </Tree>
        ) : (
          <>
            <Tree
              name="이미지 EXIF 메타데이터를 찾을 수 없음"
              defaultOpen
            ></Tree>
          </>
        )}
      </Container>
    </>
  );
}
