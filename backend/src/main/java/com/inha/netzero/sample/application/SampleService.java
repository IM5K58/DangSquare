package com.inha.netzero.sample.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inha.netzero.sample.domain.Sample;
import com.inha.netzero.sample.domain.SampleRepository;

/**
 * 응용 서비스(유스케이스). 도메인만 의존하고 presentation 계층(DTO)에는 의존하지 않는다.
 * 응답 DTO 매핑은 presentation 계층(컨트롤러)에서 수행한다.
 */
@Service
public class SampleService {

    private final SampleRepository sampleRepository;

    public SampleService(SampleRepository sampleRepository) {
        this.sampleRepository = sampleRepository;
    }

    @Transactional(readOnly = true)
    public List<Sample> findAll() {
        return sampleRepository.findAll();
    }

    @Transactional
    public Sample create(String name) {
        return sampleRepository.save(new Sample(name));
    }
}
