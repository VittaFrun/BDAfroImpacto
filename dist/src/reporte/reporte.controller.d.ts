import { ReporteGeneratorService } from './reporte-generator.service';
import { CreateReporteDto } from './create-reporte.dto';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class ReporteController {
    private readonly reporteService;
    private readonly analyticsService;
    constructor(reporteService: ReporteGeneratorService, analyticsService: AnalyticsService);
    generateReport(dto: CreateReporteDto, req: any): Promise<import("./reporte.entity").Reporte>;
    generateSimpleReport(dto: CreateReporteDto, req: any, res: any): Promise<void>;
    getReportStatus(id: number): Promise<import("./reporte.entity").Reporte>;
    downloadReport(id: number, req: any, res: any): Promise<void>;
    getProjectAnalytics(): Promise<import("../analytics/analytics.service").ProjectAnalytics>;
    getOrganizationAnalytics(id: number): Promise<import("../analytics/analytics.service").OrganizationAnalytics>;
    getVolunteerAnalytics(id: number): Promise<import("../analytics/analytics.service").VolunteerAnalytics>;
    getProjectReports(projectId: number, req: any): Promise<{
        message: string;
        projectId: number;
    }>;
}
