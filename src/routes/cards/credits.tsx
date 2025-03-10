import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  TrendingUpIcon,
  CreditCard,
  History,
} from "lucide-react";

export default function CreditsPage() {
  const creditInfo = {
    available: 250,
    used: 750,
    total: 1000,
    expiryDate: "2024-06-01",
    usageHistory: [
      {
        date: "2024-03-01",
        credits: 50,
        action: "SOP Generation",
        document: "Stanford MS CS - Statement of Purpose",
      },
      {
        date: "2024-03-02",
        credits: 30,
        action: "LOR Review",
        document: "MIT PhD - Letter of Recommendation",
      },
      {
        date: "2024-03-03",
        credits: 20,
        action: "Document Edit",
        document: "Research Statement Draft",
      },
    ],
    packages: [
      {
        name: "Basic",
        credits: 100,
        price: 10,
        features: ["SOP Generation", "Basic Editing"],
      },
      {
        name: "Pro",
        credits: 500,
        price: 40,
        features: ["SOP Generation", "Advanced Editing", "LOR Review"],
      },
      {
        name: "Ultimate",
        credits: 1000,
        price: 70,
        features: ["Unlimited Documents", "Priority Support", "All Features"],
      },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Credits</h1>
          <p className="text-muted-foreground">
            Manage your AI credit balance and usage
          </p>
        </div>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Purchase Credits
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              Available Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">{creditInfo.available}</div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
                  style={{
                    width: `${(creditInfo.used / creditInfo.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {creditInfo.used} of {creditInfo.total} credits used
              </p>
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(creditInfo.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditInfo.usageHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.document}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{item.credits} credits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Credit Packages</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {creditInfo.packages.map((pkg, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.credits} Credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-2xl font-bold">${pkg.price}</p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-center gap-2"
                        >
                          <SparklesIcon className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full">Purchase</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
