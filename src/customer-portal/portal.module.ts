import { Module } from '@nestjs/common';

// Profile
import { ProfileController }  from './profile/profile.controller';
import { ProfileService }     from './profile/profile.service';

// Appointments
import { PortalAppointmentsController } from './appointments/portal-appointments.controller';
import { PortalAppointmentsService }    from './appointments/portal-appointments.service';

// History
import { HistoryController }  from './history/history.controller';
import { HistoryService }     from './history/history.service';

// Payments
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService }    from './payments/payments.service';

// Settings
import { SettingsController } from './settings/settings.controller';
import { SettingsService }    from './settings/settings.service';

@Module({
  controllers: [
    ProfileController,
    PortalAppointmentsController,
    HistoryController,
    PaymentsController,
    SettingsController,
  ],
  providers: [
    ProfileService,
    PortalAppointmentsService,
    HistoryService,
    PaymentsService,
    SettingsService,
  ],
})
export class CustomerPortalModule {}