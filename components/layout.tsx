import {FunctionComponent} from 'react';

type LayoutProps = {
    children: JSX.Element
}

export const DefaultLayout: FunctionComponent<LayoutProps>= ({children}) => {
    return (
        <div className="container">
            {children}
        </div>
    )
}