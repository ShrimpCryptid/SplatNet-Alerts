type LayoutProps = {
    children: JSX.Element
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="container">
            {children}
        </div>
    )
}