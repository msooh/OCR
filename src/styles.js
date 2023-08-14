import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  0% {
    opacity: 0.5;
    background: #000;
  }
  100% {
    opacity: 1;
    background: #fff;
  }
`;
export const Button = styled.button`
  min-width: 100px;
  padding: 8px;
  background: ${({ primary }) => (primary ? "#000" : "#CCC")};
  color: ${({ primary }) => (primary ? "#fff" : "#666")};
  border: none;
  border-radius: 5px;
  font-size: 16px;
`;

export const Overlay = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  padding: 0;
  &:before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: #000;
    opacity: 0.5;
    z-index: 0;
  }
`;

export const ViewerWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-height: 768px;
  max-width: 768px;
  background: #fff;
  position: relative;
  z-index: 1;
  margin: auto;
  display: flex;
  flex-direction: column;
  padding: 0;
  justify-content: space-between;
  > div {
    display: flex;
    padding: 15px;
    width: calc(100% - 30px);
    margin: 0;
  }
`;
export const Header = styled.div`
  justify-content: space-between;
  background: #ccc;
  height: 30px;
  margin: 0 auto auto auto;
`;
export const Body = styled.div`
  flex-direction: column;
  height: calc(100% - 80px);
  align-items: center;
  margin: auto;
  animation: 0.5s ${fadeIn} ease-in-out;
  animation-direction: alternate;
  animation-iteration-count: ${({ loading }) => (loading ? "infinite" : 1)};
`;
export const ImageOuter = styled.div`
  /* height: auto;
  position: relative;
  padding: 0;
  background: #666;
  max-height: 600px;
  overflow: auto;
  display: inline-block; */
  display: flex;
  position: relative;
  align-items: center;
  height: 100%;
  overflow: auto;
  margin: auto;
  .img-inner {
    flex: 1;
    position: relative;
    z-index: 1;
    width: 100%;
    img {
      object-fit: cover;
      max-width: 100%;
      image-orientation: from-image;
      transform: ${({ angle }) => `rotate(${angle}deg)`};
      transition: all 0.8s ease;
      /* visibility: hidden; */
      /*
    height: auto;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    */
    }
  }
  &:after {
    content: "";
    width: 0px;
    height: ${({ toggleWith: { height } }) => `${height}px`};
    background: red;
    transition: all 0.8s ease;
  }
`;

export const Footer = styled.div`
  justify-content: space-between;
  background: #666;
  margin: auto auto 0 auto;
  height: 50px;
`;
