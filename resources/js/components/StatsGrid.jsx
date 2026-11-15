
import StatCard from './common/StatCard';

export default function StatsGrid({
    items = [],
    columns = 3,
    className = '',
}) {
    const gridColumns = {
        1: 'sm:grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-2 xl:grid-cols-4',
    };

    return (
        <div
            className={`
                grid grid-cols-1 gap-4
                ${gridColumns[columns] || gridColumns[3]}
                ${className}
            `}
        >
            {items.map((item, index) => (
                <StatCard
                    key={item.id ?? item.label ?? index}
                    {...item}
                />
            ))}
        </div>
    );
}
