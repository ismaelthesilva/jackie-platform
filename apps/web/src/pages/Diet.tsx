import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Diet: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Diet & Nutrition Plans
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Personalized nutrition strategies designed to fuel your fitness goals and optimize your health.
          </p>
        </div>

        {/* Diet Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <Badge variant="default" className="w-fit">Popular</Badge>
              <CardTitle>Weight Loss Plan</CardTitle>
              <CardDescription>
                Sustainable calorie deficit approach with balanced macronutrients for healthy weight loss.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• 1500-1800 calories/day</li>
                <li>• High protein, moderate carbs</li>
                <li>• Weekly meal prep guides</li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/contact">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Performance</Badge>
              <CardTitle>Muscle Building Plan</CardTitle>
              <CardDescription>
                High-protein nutrition strategy designed to support muscle growth and recovery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• 2200-2800 calories/day</li>
                <li>• 1.6-2.2g protein per kg</li>
                <li>• Pre/post workout nutrition</li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/contact">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">Maintenance</Badge>
              <CardTitle>Balanced Lifestyle</CardTitle>
              <CardDescription>
                Flexible approach for maintaining current weight while optimizing health and energy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• Maintenance calories</li>
                <li>• 80/20 flexible approach</li>
                <li>• Sustainable habits</li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Guidelines</CardTitle>
            <CardDescription>
              Key principles to follow regardless of your specific plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Hydration</h4>
                <p className="text-sm text-muted-foreground">
                  Aim for 8-10 glasses of water daily, more during intense training.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Meal Timing</h4>
                <p className="text-sm text-muted-foreground">
                  Eat within 2 hours post-workout for optimal recovery.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Whole Foods</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on minimally processed, nutrient-dense foods.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Consistency</h4>
                <p className="text-sm text-muted-foreground">
                  Small, consistent changes lead to long-term success.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Diet;