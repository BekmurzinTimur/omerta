export type RegionData = {
	name: string;
	description: string;
	image: string;
	bonus: number;
};

export const REGIONS_DATA: RegionData[] = [
	{
		name: 'Downtown Financial District',
		description:
			'Towering skyscrapers and construction sites where lucrative no-show jobs generate significant influence and income.',
		image: '/regions/1.png',
		bonus: 100
	},
	{
		name: 'Industrial Harbor',
		description:
			'Bustling docks and warehouses offering control of smuggling operations and illicit trade routes.',
		image: '/regions/2.png',
		bonus: 40
	},
	{
		name: 'Little Italy',
		description:
			'Traditional neighborhood controlling union-backed wholesale markets and citywide distribution networks.',
		image: '/regions/3.png',
		bonus: 50
	},
	{
		name: 'Entertainment District',
		description:
			'Glittering casinos and nightclubs providing substantial income and connections to influential figures.',
		image: '/regions/4.png',
		bonus: 80
	},
	{
		name: 'Suburban Sprawl',
		description:
			'Expanding residential zones with profitable loan sharking operations and money laundering opportunities.',
		image: '/regions/6.png',
		bonus: 20
	},
	{
		name: 'Uptown Heights',
		description:
			'Affluent area with lucrative protection rackets and valuable connections to corrupt officials.',
		image: '/regions/5.png',
		bonus: 60
	},
	{
		name: 'East End Slums',
		description:
			'Impoverished district where waste management contracts provide the perfect cover for disposing of evidence.',
		image: '/regions/7.png',
		bonus: 10
	}
];
