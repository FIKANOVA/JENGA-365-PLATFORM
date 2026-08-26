import { PortableTextComponents } from "@portabletext/react";

export const components: PortableTextComponents = {
    types: {
        image: ({ value }: any) => {
            if (!value?.url) return null;
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={value.url} alt={value?.alt ?? ""} className="rounded-md w-full my-8" />;
        },
    },
    marks: {
        link: ({ children, value }: any) => {
            const href = (value?.href ?? "") as string;
            const isSafe = href.startsWith("/") || href.startsWith("https://jenga365.org") || href.startsWith("https://jenga365.com");
            return isSafe ? (
                <a href={href} rel="noopener noreferrer">
                    {children}
                </a>
            ) : (
                <span>{children}</span>
            );
        },
    },
    unknownMark: ({ children }: any) => <span>{children}</span>,
    unknownType: () => null,
};
