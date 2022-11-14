import {ToastContainer, toast, Zoom} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type LayoutProps = {
    children: JSX.Element
}

export default function Layout({ children }: LayoutProps) {
  // TODO: Custom animation for toasts
  return (
      <div className="container">
          {children}
          <ToastContainer
            position={toast.POSITION.BOTTOM_CENTER}
            transition={Zoom}
            theme={"dark"}
          />
      </div>
  )
}