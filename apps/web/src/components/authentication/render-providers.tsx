import { Fragment } from "react";
import * as SocialIcons from "@/components/authentication/icons-list";
import { Button } from "@/components/ui/button";
import type { SocialProvider } from "@/utils/zod-schemas/social-providers";

function capitalize(word: string) {
  const lower = word.toLowerCase();
  return word.charAt(0).toUpperCase() + lower.slice(1);
}

export const RenderProviders = ({
  providers,
  onProviderLoginRequested,
  isLoading,
}: {
  providers: SocialProvider[];
  onProviderLoginRequested: (provider: SocialProvider) => void;
  isLoading: boolean;
}) => (
  <div className="flex justify-between">
    {providers.map((provider) => {
      const AuthIcon = SocialIcons[provider];

      return (
        <Fragment key={provider}>
          <Button
            className="h-10 rounded-lg border border-input bg-background text-foreground"
            disabled={isLoading}
            onClick={() => onProviderLoginRequested(provider)}
            size="default"
            variant="outline"
          >
            <div className="mr-2">
              <AuthIcon />
            </div>
            <span className="">{capitalize(provider)}</span>
          </Button>
        </Fragment>
      );
    })}
  </div>
);
