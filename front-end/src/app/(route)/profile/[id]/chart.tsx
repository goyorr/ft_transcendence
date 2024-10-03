"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTranslation } from "@/hooks/useTranslation"

let chartConfig = {
  visitors: {
    label: "Visitors",
    color: "#cccccc", 
  },
  tournaments: {
    label: "Tournaments",
    color: "#8b5cf6",
  },
  Win: {
    label: "Win",
    color: "#3b82f6",
  },
  Lose: {
    label: "Lose",
    color: "#f43f5e",
  },
} satisfies ChartConfig

const Doughnut: React.FC<any> = ({ chartDataDoghnut }) => {
  
  const {t} = useTranslation()

  const totalVisitors = React.useMemo(() => {
    return chartDataDoghnut.reduce((acc: any, curr: any) => acc + curr.visitors, 0)
  }, [chartDataDoghnut])

  return (
    <Card className="flex flex-col bg-transparent border-none">
      <CardHeader className="items-start pb-0">
        <CardTitle>{t('__total_results')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 mt-[2rem]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartDataDoghnut}
              dataKey="visitors"
              nameKey="results"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={8}
            >
              {chartDataDoghnut.map((entry: { results: keyof typeof chartConfig; visitors: number }, index: number) => (
                <Cell key={`cell-${index}`} fill={chartConfig[entry.results]?.color || "#ccc"} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Games
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default Doughnut
