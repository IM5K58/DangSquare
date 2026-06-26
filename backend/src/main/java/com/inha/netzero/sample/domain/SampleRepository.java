package com.inha.netzero.sample.domain;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 리포지토리 인터페이스를 도메인 레이어에 둔다(실용 DDD).
 */
public interface SampleRepository extends JpaRepository<Sample, Long> {
}
