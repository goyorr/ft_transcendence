"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { Accumulator, ChartData } from "@/types/types"
import { useTranslation } from "@/hooks/useTranslation"



const chartConfig = {
    desktop: {
        label: "win",
        color: "#4c1d95",
    },
    mobile: {
        label: "lose",
        color: "blue",
    },
} satisfies ChartConfig

const ChartBar: React.FC<{ chartData: ChartData[] }> = ({ chartData }) => {

    const [min, setMin] = useState<number>(-1);
    const [max, setMax] = useState<number>(-1);


    const {t} = useTranslation()

    const getCurrentYear = (): number => {
        const date = new Date();

        const dateObject = date.getFullYear();

        return dateObject
    }

    useEffect(() => {
        if (chartData) {
            const { min, max } = chartData.reduce<Accumulator>(
                (acc, curr) => {
                    return {
                        min: Math.min(acc.min, curr.win, curr.lose),
                        max: Math.max(acc.max, curr.win, curr.lose),
                    };
                },
                { min: Infinity, max: -Infinity }
            );

            setMin(min);
            setMax(max);
        }
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('lastmonthstatistic')}</CardTitle>
                <CardDescription className="font-extrabold">{chartData && chartData[0].month} - {chartData && chartData[5].month} {getCurrentYear()}</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData && chartData?.length > 0 && (
                    <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                type="number"
                                domain={[min, max]}
                                allowDecimals={false}
                                label={{ value: t('numberogames'), angle: -90, position: 'insideLeft' }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="win" fill="var(--color-desktop)" radius={4} />
                            <Bar dataKey="lose" fill="var(--color-mobile)" radius={4} />
                        </BarChart>
                    </ChartContainer>

                )}
            </CardContent>
        </Card>
    )
}


export default ChartBar